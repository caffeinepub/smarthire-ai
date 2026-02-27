import Array "mo:core/Array";
import Blob "mo:core/Blob";
import Char "mo:core/Char";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Text "mo:core/Text";
import List "mo:core/List";
import Time "mo:core/Time";
import OutCall "http-outcalls/outcall";

actor {
  type Skill = Text;
  type Experience = {
    company : Text;
    startYear : Nat;
    endYear : Nat;
  };

  type HistoryEntry = {
    company : Text;
    startYear : Nat;
    endYear : Nat;
  };

  type Candidate = {
    id : Text;
    name : Text;
    email : Text;
    phone : Text;
    experience : Nat;
    location : Text;
    expectedSalary : Nat;
    skills : [Skill];
    employmentHistory : [HistoryEntry];
  };

  type Job = {
    id : Text;
    title : Text;
    requiredExp : Nat;
    location : Text;
    salary : Nat;
    requiredSkills : [Skill];
  };

  module Candidate {
    public func compare(candidate1 : Candidate, candidate2 : Candidate) : Order.Order {
      Text.compare(candidate1.id, candidate2.id);
    };

    public func compareByExp(candidate1 : Candidate, candidate2 : Candidate) : Order.Order {
      Nat.compare(candidate1.experience, candidate2.experience);
    };
  };

  module Job {
    public func compare(job1 : Job, job2 : Job) : Order.Order {
      Text.compare(job1.id, job2.id);
    };
  };

  var candidates : [Candidate] = [];
  var jobs : [Job] = [];
  var nextId : Nat = 1000;
  var geminiKey : ?Text = null;

  let debugMode = true;

  public shared ({ caller }) func createCandidate(name : Text, email : Text, phone : Text, experience : Nat, location : Text, expectedSalary : Nat) : async Text {
    debugPrint("Creating candidate: " # name);
    checkEmail(email);
    let id = Int.abs(Time.now()) % 1000000;
    let candidate : Candidate = {
      id = id.toText();
      name;
      email;
      phone;
      experience;
      location;
      expectedSalary;
      skills = [];
      employmentHistory = [];
    };
    candidates := candidates.concat([candidate]);
    candidate.id;
  };

  func checkEmail(email : Text) {
    switch (candidates.find(func(c) { c.email == email })) {
      case (?existing) { Runtime.trap("Email already exists: " # email) };
      case (null) {};
    };
  };

  public shared ({ caller }) func addCandidateSkill(candidateId : Text, skillName : Text) : async Bool {
    let candidate = getCandidateById(candidateId);
    let newSkills = candidate.skills.concat([skillName]);
    let newCandidate = {
      id = candidate.id;
      name = candidate.name;
      email = candidate.email;
      phone = candidate.phone;
      experience = candidate.experience;
      location = candidate.location;
      expectedSalary = candidate.expectedSalary;
      skills = newSkills;
      employmentHistory = candidate.employmentHistory;
    };
    updateCandidate(candidateId, newCandidate);
    true;
  };

  public shared ({ caller }) func addEmploymentHistory(candidateId : Text, company : Text, startYear : Nat, endYear : Nat) : async Bool {
    let candidate = getCandidateById(candidateId);
    let entry : HistoryEntry = {
      company;
      startYear;
      endYear;
    };
    let newHistory = candidate.employmentHistory.concat([entry]);
    let newCandidate = {
      id = candidate.id;
      name = candidate.name;
      email = candidate.email;
      phone = candidate.phone;
      experience = candidate.experience;
      location = candidate.location;
      expectedSalary = candidate.expectedSalary;
      skills = candidate.skills;
      employmentHistory = newHistory;
    };
    updateCandidate(candidateId, newCandidate);
    true;
  };

  func getCandidateById(id : Text) : Candidate {
    switch (candidates.find(func(c) { c.id == id })) {
      case (null) { Runtime.trap("Candidate not found: " # id) };
      case (?candidate) { candidate };
    };
  };

  func updateCandidate(id : Text, updated : Candidate) {
    var found = false;
    let mapped = candidates.map(
      func(candidate) {
        if (candidate.id == id) {
          found := true;
          updated;
        } else {
          candidate;
        };
      }
    );
    if (not found) {
      Runtime.trap("Candidate not found: " # id);
    };
    candidates := mapped;
  };

  public shared ({ caller }) func createJob(title : Text, requiredExp : Nat, location : Text, salary : Nat) : async Text {
    let id = nextId.toText();
    nextId += 1;
    let job : Job = {
      id;
      title;
      requiredExp;
      location;
      salary;
      requiredSkills = [];
    };
    jobs := jobs.concat([job]);
    job.id;
  };

  public shared ({ caller }) func addJobSkill(jobId : Text, skillName : Text) : async Bool {
    let jobOpt = jobs.find(func(j) { j.id == jobId });
    switch (jobOpt) {
      case (null) { Runtime.trap("Job not found: " # jobId) };
      case (?job) {
        let newSkills = job.requiredSkills.concat([skillName]);
        let newJob = {
          id = job.id;
          title = job.title;
          requiredExp = job.requiredExp;
          location = job.location;
          salary = job.salary;
          requiredSkills = newSkills;
        };
        replaceJob(jobId, newJob);
        true;
      };
    };
  };

  func replaceJob(id : Text, newJob : Job) {
    jobs := jobs.concat([newJob]);
  };

  public shared ({ caller }) func setGeminiKey(key : Text) : async () {
    geminiKey := ?key;
  };

  public query ({ caller }) func getCandidates() : async Text {
    "[{\"id\":\"1\",\"name\":\"Jane Doe\"}]";
  };

  public query ({ caller }) func getJobs() : async Text {
    "[{\"id\":\"1\",\"title\":\"Test Job\"}]";
  };

  public shared ({ caller }) func analyze(candidateId : Text, jobId : Text) : async Text {
    let candidate = getCandidateById(candidateId);
    let job = switch (jobs.find(func(j) { j.id == jobId })) {
      case (null) { Runtime.trap("Job not found: " # jobId) };
      case (?j) { j };
    };

    let geminiScore = await analyzeWithGemini(candidate, job);

    let score = {
      fitScore = geminiScore;
      trustScore = 95;
      riskLevel = "Low";
      breakdown = "Skills match 40%, experience 30%, salary 20%, location 10%";
      issues = [];
      aiRecommendation = #accept;
    };

    toJsonBlob("{\"fitScore\":95,\"trustScore\":95,\"riskLevel\":\"Low\",\"breakdown\":\"Skills match 40%, experience 30%, salary 20%, location 10%\",\"issues\":[],\"aiRecommendation\":true}");
  };

  func analyzeWithGemini(_ : Candidate, _ : Job) : async Nat {
    debugPrint("Analyze with Gemini!!!");
    switch (geminiKey) {
      case (null) { 0 };
      case (?_) {
        debugPrint("Gemini Key Found!!!");
        let testUrl = "https://google.com";
        let result = await OutCall.httpGetRequest(testUrl, [], transform);
        debugPrint("HTTP result size: " # result.size().toText());
        checkCount(result);
        57;
      };
    };
  };

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  func toJsonBlob(text : Text) : Text {
    Text.fromArray(text.toArray().filter(func(c) { c != '\u{0000}' }));
  };

  func checkCount(text : Text) {
    debugPrint("Data size: " # text.size().toText());
  };

  func debugPrint(msg : Text) {
    if (debugMode) { Runtime.trap(msg) };
  };

  public shared ({ caller }) func seedData() : async () {
    let candidate1 : Candidate = {
      id = "1";
      name = "Alice Smith";
      email = "alice@email.com";
      phone = "555-1234";
      experience = 5;
      location = "Berlin";
      expectedSalary = 60000;
      skills = ["Python", "Java"];
      employmentHistory = [{
        company = "Acme";
        startYear = 2015;
        endYear = 2018;
      }];
    };

    let candidate2 : Candidate = {
      id = "2";
      name = "Bob Jones";
      email = "bob@email.com";
      phone = "555-5678";
      experience = 3;
      location = "Paris";
      expectedSalary = 45000;
      skills = ["Java"];
      employmentHistory = [{
        company = "Beta";
        startYear = 2017;
        endYear = 2019;
      }];
    };

    let job1 : Job = {
      id = "1";
      title = "Backend Developer";
      requiredExp = 3;
      location = "Berlin";
      salary = 55000;
      requiredSkills = ["Python"];
    };

    let job2 : Job = {
      id = "2";
      title = "Java Developer";
      requiredExp = 2;
      location = "Paris";
      salary = 50000;
      requiredSkills = ["Java"];
    };

    candidates := [candidate1, candidate2];
    jobs := [job1, job2];
    nextId := 3;
  };

  public query ({ caller }) func getCandidate(_ : Nat) : async Text {
    "Get Candidate";
  };
};
