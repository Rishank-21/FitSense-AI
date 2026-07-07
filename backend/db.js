const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fitsense';

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let isUsingFallback = false;

// Custom JSON File-based Mock Model implementation for fallback
class MockModel {
  constructor(name) {
    this.name = name;
    this.filePath = path.join(dataDir, `${name.toLowerCase()}s.json`);
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
    }
  }

  _read() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  }

  _write(data) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  async find(query = {}) {
    const data = this._read();
    return data.filter(item => {
      for (let key in query) {
        if (query[key] !== undefined && item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
  }

  async findOne(query = {}) {
    const list = await this.find(query);
    return list[0] || null;
  }

  async findById(id) {
    return this.findOne({ _id: id });
  }

  async create(docData) {
    const list = this._read();
    const newDoc = {
      _id: Math.random().toString(36).substring(2, 11),
      createdAt: new Date(),
      ...docData,
    };
    list.push(newDoc);
    this._write(list);
    
    // Add save support for created documents
    newDoc.save = async function() {
      const dbList = JSON.parse(fs.readFileSync(this.filePath || path.join(dataDir, `${name.toLowerCase()}s.json`), 'utf8'));
      const idx = dbList.findIndex(x => x._id === this._id);
      if (idx !== -1) {
        dbList[idx] = { ...this };
        delete dbList[idx].save;
        fs.writeFileSync(this.filePath, JSON.stringify(dbList, null, 2));
      }
      return this;
    };
    
    return newDoc;
  }

  async countDocuments(query = {}) {
    const list = await this.find(query);
    return list.length;
  }

  async updateOne(query = {}, updateData = {}) {
    const list = this._read();
    const item = list.find(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
    if (item) {
      Object.assign(item, updateData.$set || updateData);
      this._write(list);
      return { modifiedCount: 1 };
    }
    return { modifiedCount: 0 };
  }

  async aggregate(pipeline = []) {
    // Basic aggregation support for simple statistics:
    // e.g., sum of calories, user counts, grouping by exercise type.
    let data = this._read();
    
    // Simplified handlers for matches and groupings used in history analytics
    for (const stage of pipeline) {
      if (stage.$match) {
        data = data.filter(item => {
          for (let key in stage.$match) {
            if (stage.$match[key] !== undefined && item[key] !== stage.$match[key]) {
              return false;
            }
          }
          return true;
        });
      }
      
      if (stage.$group) {
        const idExpr = stage.$group._id;
        const groups = {};
        for (const item of data) {
          let groupId = 'total';
          if (typeof idExpr === 'string' && idExpr.startsWith('$')) {
            groupId = item[idExpr.slice(1)];
          }
          if (!groups[groupId]) {
            groups[groupId] = { _id: groupId };
            for (let k in stage.$group) {
              if (k !== '_id') groups[groupId][k] = 0;
            }
          }
          
          for (let k in stage.$group) {
            if (k === '_id') continue;
            const op = stage.$group[k];
            if (op.$sum) {
              const val = typeof op.$sum === 'number' ? op.$sum : (item[op.$sum.slice(1)] || 0);
              groups[groupId][k] += val;
            } else if (op.$avg) {
              // Track sum and count to compute avg later
              if (!groups[groupId][`_avg_sum_${k}`]) {
                groups[groupId][`_avg_sum_${k}`] = 0;
                groups[groupId][`_avg_cnt_${k}`] = 0;
              }
              const val = typeof op.$avg === 'number' ? op.$avg : (item[op.$avg.slice(1)] || 0);
              groups[groupId][`_avg_sum_${k}`] += val;
              groups[groupId][`_avg_cnt_${k}`] += 1;
              groups[groupId][k] = Math.round(groups[groupId][`_avg_sum_${k}`] / groups[groupId][`_avg_cnt_${k}`]);
            }
          }
        }
        return Object.values(groups);
      }
    }
    return data;
  }
}

const mockDb = {
  User: new MockModel('User'),
  Workout: new MockModel('Workout'),
  AIFeedback: new MockModel('AIFeedback'),
};

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log('MongoDB Connected successfully.');
    isUsingFallback = false;
  } catch (err) {
    console.warn(`\n[WARNING] MongoDB Connection Failed: ${err.message}`);
    console.warn('=> FitSense is falling back to a local JSON Database store in backend/data/.\n');
    isUsingFallback = true;
  }
};

module.exports = {
  connectDB,
  isFallback: () => isUsingFallback,
  getFallbackModel: (name) => mockDb[name],
};
