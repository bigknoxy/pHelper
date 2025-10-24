import client from './client';
export var ExerciseCategory;
(function (ExerciseCategory) {
    ExerciseCategory["STRENGTH"] = "STRENGTH";
    ExerciseCategory["CARDIO"] = "CARDIO";
    ExerciseCategory["FLEXIBILITY"] = "FLEXIBILITY";
    ExerciseCategory["BALANCE"] = "BALANCE";
    ExerciseCategory["FUNCTIONAL"] = "FUNCTIONAL";
    ExerciseCategory["SPORTS"] = "SPORTS";
})(ExerciseCategory || (ExerciseCategory = {}));
export var MuscleGroup;
(function (MuscleGroup) {
    MuscleGroup["CHEST"] = "CHEST";
    MuscleGroup["BACK"] = "BACK";
    MuscleGroup["SHOULDERS"] = "SHOULDERS";
    MuscleGroup["BICEPS"] = "BICEPS";
    MuscleGroup["TRICEPS"] = "TRICEPS";
    MuscleGroup["FOREARMS"] = "FOREARMS";
    MuscleGroup["CORE"] = "CORE";
    MuscleGroup["QUADRICEPS"] = "QUADRICEPS";
    MuscleGroup["HAMSTRINGS"] = "HAMSTRINGS";
    MuscleGroup["GLUTES"] = "GLUTES";
    MuscleGroup["CALVES"] = "CALVES";
    MuscleGroup["FULL_BODY"] = "FULL_BODY";
})(MuscleGroup || (MuscleGroup = {}));
export var ExerciseDifficulty;
(function (ExerciseDifficulty) {
    ExerciseDifficulty["BEGINNER"] = "BEGINNER";
    ExerciseDifficulty["INTERMEDIATE"] = "INTERMEDIATE";
    ExerciseDifficulty["ADVANCED"] = "ADVANCED";
})(ExerciseDifficulty || (ExerciseDifficulty = {}));
export async function getExercises(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
        }
    });
    const res = await client.get(`/exercises?${params.toString()}`);
    return res.data;
}
export async function getExerciseById(id) {
    const res = await client.get(`/exercises/${id}`);
    return res.data;
}
export async function createExercise(exercise) {
    const res = await client.post('/exercises', exercise);
    return res.data;
}
export async function updateExercise(id, exercise) {
    const res = await client.put(`/exercises/${id}`, exercise);
    return res.data;
}
export async function deleteExercise(id) {
    await client.delete(`/exercises/${id}`);
}
export async function getExerciseCategories() {
    const res = await client.get('/exercises/categories');
    return res.data;
}
export async function getMuscleGroups() {
    const res = await client.get('/exercises/muscle-groups');
    return res.data;
}
