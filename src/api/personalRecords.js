import client from './client';
export var RecordType;
(function (RecordType) {
    RecordType["MAX_WEIGHT"] = "MAX_WEIGHT";
    RecordType["MAX_REPS"] = "MAX_REPS";
    RecordType["MAX_SETS"] = "MAX_SETS";
    RecordType["PERSONAL_BEST"] = "PERSONAL_BEST";
    RecordType["WORKOUT_VOLUME"] = "WORKOUT_VOLUME";
    RecordType["EXERCISE_FREQUENCY"] = "EXERCISE_FREQUENCY";
})(RecordType || (RecordType = {}));
export async function getPersonalRecords(filters = {}) {
    const params = new URLSearchParams();
    if (filters.exerciseId)
        params.append('exerciseId', filters.exerciseId);
    if (filters.recordType)
        params.append('recordType', filters.recordType);
    if (filters.limit)
        params.append('limit', filters.limit.toString());
    if (filters.offset)
        params.append('offset', filters.offset.toString());
    const res = await client.get(`/personal-records?${params.toString()}`);
    return res.data;
}
export async function getPersonalRecordById(id) {
    const res = await client.get(`/personal-records/${id}`);
    return res.data;
}
export async function getPersonalRecordStats(exerciseId) {
    const params = new URLSearchParams();
    if (exerciseId)
        params.append('exerciseId', exerciseId);
    const res = await client.get(`/personal-records/stats?${params.toString()}`);
    return res.data;
}
export async function deletePersonalRecord(id) {
    await client.delete(`/personal-records/${id}`);
}
