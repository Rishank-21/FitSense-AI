const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config');

let genAI = null;
if (config.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
    console.log('Gemini AI Service initialized successfully.');
  } catch (error) {
    console.error('Error initializing Gemini GenAI client:', error.message);
  }
} else {
  console.log('Gemini API Key missing. Activating Mock AI Coach Fallback.');
}

/**
 * Call Gemini or run mock fallback
 */
async function generateContent(prompt, systemInstruction = '') {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
        systemInstruction: systemInstruction || 'You are FitSense AI, a premium virtual personal trainer and contactless fitness coach. Always return responses in clean, beautifully formatted Markdown with encouraging, professional tone.'
      });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (err) {
      console.error('Gemini API execution error, falling back to Mock AI:', err.message);
    }
  }

  // High-quality local Mock AI generator
  return getMockAIResponse(prompt);
}

/**
 * Generate a training plan based on user goals
 */
async function getTrainingPlan(userProfile) {
  const systemInstruction = 'You are an elite fitness planner. Create a customized weekly training schedule based on user metrics and fitness goals.';
  const prompt = `
    User Profile:
    - Name: ${userProfile.name}
    - Age: ${userProfile.age} years
    - Gender: ${userProfile.gender}
    - Weight: ${userProfile.weight} kg
    - Height: ${userProfile.height} cm
    - Fitness Goal: ${userProfile.fitnessGoal}

    Please output a detailed 7-day workout routine table, dietary recommendations, and key fitness focus areas. Return in clean Markdown format.
  `;
  return generateContent(prompt, systemInstruction);
}

/**
 * Generate live feedback/posture summary
 */
async function getWorkoutSummary(sessionData) {
  const prompt = `
    User Session Summary:
    - Exercise: ${sessionData.exercise}
    - Duration: ${Math.round(sessionData.duration / 60)} minutes (${sessionData.duration} seconds)
    - Repetitions completed: ${sessionData.reps} (Goal: ${sessionData.goalReps})
    - Calories burned: ${sessionData.calories} kcal
    - Average Heart Rate: ${sessionData.avgHeartRate} BPM
    - Average Breathing Rate: ${sessionData.avgBreathingRate} BPM

    Analyze this workout session, explain how it aligns with the user's progress, and provide 3 tailored coaching tips (concerning breathing pattern, posture stability, and recovery).
  `;
  return generateContent(prompt);
}

/**
 * Generate real-time posture advice
 */
async function getPostureAdvice(exercise, poseHistory) {
  const prompt = `
    Exercise Type: ${exercise}
    Pose state sequence recorded: ${JSON.stringify(poseHistory)}

    Analyze this movement history and provide 2 bullet-point action steps to optimize posture stability and movement mechanics.
  `;
  return generateContent(prompt);
}

/**
 * Local mock generator for detailed trainer feedbacks
 */
function getMockAIResponse(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  
  const disclaimer = `\n\n> [!NOTE]\n> *💡 Simulated AI Coach - Provide your \`GEMINI_API_KEY\` in backend/.env to connect this to real-time Gemini AI.*`;

  if (lowerPrompt.includes('fitness goal') || lowerPrompt.includes('training-plan') || lowerPrompt.includes('profile')) {
    // Return a beautiful weekly training plan
    return `### FitSense Weekly Training Routine

Welcome to your personalized training program. This plan is optimized for your fitness objectives.

#### 📅 Weekly Schedule

| Day | Workout Type | Focus Exercises | Duration | Target Intensity |
| :--- | :--- | :--- | :---: | :---: |
| **Monday** | Upper Body Strength | Push-ups, Planks, Dumbbell Rows | 45 min | Moderate-High |
| **Tuesday** | Cardio & Endurance | Running, Jumping Jacks, Walking | 35 min | High |
| **Wednesday** | Recovery & Core | Yoga, Stretches, Plank stability | 30 min | Low |
| **Thursday** | Lower Body Power | Squats, Lunges, Calf Raises | 40 min | High |
| **Friday** | HIIT Core | Jumping Jacks, Squats, Planks | 30 min | Max Effort |
| **Saturday** | Steady State Cardio | Running, Hiking, Walking | 50 min | Moderate |
| **Sunday** | Active Recovery | Gentle Yoga, Mobility drills | 20 min | Very Low |

#### 🥗 Nutritional Focus Areas
* **Hydration**: Consume at least 3-3.5 liters of water daily, especially before and during cardio sessions.
* **Protein Intake**: Target 1.6g of protein per kg of body weight to support muscle recovery and lean body mass development.
* **Complex Carbs**: Fuel your sessions with oats, sweet potatoes, and brown rice 90 minutes before working out.

#### 📈 Coach Key Guidance
* Focus on completing full range of motion for squats and lunges.
* Maintain breathing synchronization: exhale during exertion, inhale during recovery.
${disclaimer}`;
  }

  if (lowerPrompt.includes('duration') || lowerPrompt.includes('calories') || lowerPrompt.includes('heart rate')) {
    // Return workout session summary
    const matches = prompt.match(/Exercise:\s*(\w+)/i);
    const exercise = matches ? matches[1] : 'Workout';
    
    return `### 🏋️ FitSense Workout Report: ${exercise.toUpperCase()}

Fantastic job completing your session! You showed great consistency and cardiovascular stamina.

#### 📊 Performance Insights
* **Cardio Response**: Your heart rate showed an excellent aerobic adaptation curve, staying within healthy fat-burning zones.
* **Breathing Quality**: Breathing rate indicators suggest you maintained good steady-state control.
* **Energy Output**: Excellent MET-based calorie burn which contributes directly to your metabolic deficit targets.

#### 💡 Coach Tips for Next Time
1. **Steady Progression**: Try increasing your target repetition count or active duration by 5-10% in your next session.
2. **Breathing Mechanics**: For ${exercise}, focus on deep diaphragmatic breathing to keep your heart rate in control during high intensity peaks.
3. **Optimized Rest**: Keep rest intervals between sets to 60-90 seconds to maintain metabolic efficiency.
${disclaimer}`;
  }

  // Return standard coaching tips
  return `### 🧘 Posture & Movement Feedback

Based on your real-time RuView contactless motion signatures, here is your structural feedback:

* **Core Brace**: Ensure your core is actively engaged. Keeping a tight core will protect your lower back and keep your hips aligned.
* **Pace & Control**: Slow down the eccentric phase (the downward movement). Control is more important than speed.
* **Vitals Check**: Keep your chest open to maximize lung volume, keeping your oxygen levels balanced.
${disclaimer}`;
}

module.exports = {
  getTrainingPlan,
  getWorkoutSummary,
  getPostureAdvice,
  generateContent
};
