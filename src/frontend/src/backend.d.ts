import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface backendInterface {
    addCandidateSkill(candidateId: string, skillName: string): Promise<boolean>;
    addEmploymentHistory(candidateId: string, company: string, startYear: bigint, endYear: bigint): Promise<boolean>;
    addJobSkill(jobId: string, skillName: string): Promise<boolean>;
    analyze(candidateId: string, jobId: string): Promise<string>;
    createCandidate(name: string, email: string, phone: string, experience: bigint, location: string, expectedSalary: bigint): Promise<string>;
    createJob(title: string, requiredExp: bigint, location: string, salary: bigint): Promise<string>;
    getCandidate(arg0: bigint): Promise<string>;
    getCandidates(): Promise<string>;
    getJobs(): Promise<string>;
    seedData(): Promise<void>;
    setGeminiKey(key: string): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
