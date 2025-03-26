declare namespace GoogleAppsScript {
  namespace Buganizer {
    interface BuganizerApp {
      Action: typeof Action;
      DateType: typeof DateType;
      FormattingMode: typeof FormattingMode;
      Priority: typeof Priority;
      IssueStatus: typeof IssueStatus;
      IssueView: typeof IssueView;
      Severity: typeof Severity;
      Type: typeof Type;
      AllocationInvolvement: typeof AllocationInvolvement;
      JobRole: typeof JobRole;
      PlannedAllocationEntityKind: typeof PlannedAllocationEntityKind;
      AllocationKind: typeof AllocationKind;
      createBug(componentId: string, summary: string): Buganizer.Bug;
      createBug(
        componentId: string,
        summary: string,
        reporter: string,
        note: string,
      ): Buganizer.Bug;
      createBug(
        componentId: string,
        summary: string,
        options: BugFilingOptions,
      ): Buganizer.Bug;
      createHotlist(name: string, description: string): Buganizer.Hotlist;
      createComponent(parentId: number, name: string): Buganizer.Component;
      createComponent(
        parentId: number,
        name: string,
        description: string,
      ): Buganizer.Component;
      createQuery(): Buganizer.Query;
      getBug(id: string): Buganizer.Bug;
      getBugs(bugIds: string[]): Buganizer.Bug[];
      getBugs(
        bugIds: string[],
        issueView: Buganizer.IssueView,
      ): Buganizer.Bug[];
      getComponentById(id: number): Buganizer.Component;
      getComponentByPath(path: string): Buganizer.Component;
      getHistoryForBugIds(ids: string[]): Buganizer.BugHistory[];
      getHistoryForBugs(bug: Buganizer.Bug[]): Buganizer.BugHistory[];
      getHotlist(id: string): Buganizer.Hotlist;
      getSavedSearch(id: string): Buganizer.Bug[];
      getSavedSearch(
        id: string,
        issueView: Buganizer.IssueView,
      ): Buganizer.Bug[];
      searchBugs(query: string): Buganizer.Bug[];
      searchBugs(
        query: string,
        issueView: Buganizer.IssueView,
      ): Buganizer.Bug[];
      searchComponents(query: string): Buganizer.Component[];
      searchHotlists(query: string): Buganizer.Hotlist[];
    }

    interface Bug {
      addBlocking(bugId: string): Buganizer.Bug;
      addCC(ldap: string): Buganizer.Bug;
      addChild(bugId: string): Buganizer.Bug;
      addCollaborator(emailAddress: string): Buganizer.Bug;
      addDependsOn(bugId: string): Buganizer.Bug;
      addFoundIn(foundIn: string): Buganizer.Bug;
      addParent(bugId: string): Buganizer.Bug;
      addTargetedTo(targetedTo: string): Buganizer.Bug;
      addToHotlist(hotlistId: string): Buganizer.Bug;
      addVerifiedIn(verifiedIn: string): Buganizer.Bug;
      getAllCustomFields(): Buganizer.CustomField[];
      getAncestors(): object;
      getAssignee(): string;
      getAssignmentSlo(): Buganizer.BugSlo;
      getBlocking(): string[];
      getCC(): string[];
      getChangelists(): string[];
      getChildIssueCount(): number;
      getChildren(): string[];
      getClosureSlo(): Buganizer.BugSlo;
      getCollaborators(): string[];
      getComponentId(): number;
      getComponentPath(): string[];
      getContents(): string[];
      getCreatedTime(): Date;
      getCustomFields(): Buganizer.CustomField[];
      getDependsOn(): string[];
      getDuplicateOf(): string;
      getEstimatedEffort(): string;
      getEstimatedEffortTotalComplete(): number;
      getEstimatedEffortTotalOpen(): number;
      getFirstNote(): string;
      getFoundIn(): string[];
      getHistory(): Buganizer.BugHistory;
      getHotlistIds(): string[];
      getId(): string;
      getInProd(): boolean;
      getIssueStatus(): Buganizer.IssueStatus;
      getMeTooCount(): number;
      getModifiedTime(): Date;
      getParents(): string[];
      getPostmortems(): string[];
      getPriority(): number;
      getResponseSlo(): Buganizer.BugSlo;
      getReporter(): string;
      getResolvedTime(): Date;
      getSeverity(): number;
      getSloStartsOn(): Date;
      getStaffing(): Buganizer.BugStaffing;
      getStatus(): string; // DEPRECATED - use getIssueStatus
      getStatusUpdate(): string;
      getStatusUpdatedTime(): Date;
      getStatusUpdateAuthor(): string;
      getSummary(): string;
      getTargetedTo(): string[];
      getType(): string;
      getVerifiedIn(): string[];
      getVerifiedTime(): Date;
      getVerifier(): string;
      isOpen(): boolean;
      removeBlocking(bugId: string): Buganizer.Bug;
      removeCC(ldap: string): Buganizer.Bug;
      removeChild(bugId: string): Buganizer.Bug;
      removeCollaborator(emailAddress: string): Buganizer.Bug;
      removeDependsOn(bugId: string): Buganizer.Bug;
      removeFoundIn(foundIn: string): Buganizer.Bug;
      removeFromHotlist(hotlistId: string): Buganizer.Bug;
      removeParent(bugId: string): Buganizer.Bug;
      removeTargetedTo(targetedTo: string): Buganizer.Bug;
      removeVerifiedIn(verifiedIn: string): Buganizer.Bug;
      repositionInHotlist(hotlistId: string, position: number): Buganizer.Bug;
      save(): Buganizer.Bug;
      save(bugAction: Buganizer.Action): Buganizer.Bug; // DEPRECATED
      setAssignee(assignee: string): Buganizer.Bug;
      setBlocking(bugIds: string[]): Buganizer.Bug;
      setCC(ldaps: string[]): Buganizer.Bug;
      setChangelists(changelists: string[]): Buganizer.Bug;
      setChildren(bugIds: string[]): Buganizer.Bug;
      setCollaborators(emailAddresses: string[]): Buganizer.Bug;
      setComponentId(componentId: number): Buganizer.Bug;
      setComponentPath(path: string): Buganizer.Bug;
      setCustomField(
        field: Buganizer.CustomField | string,
        value: string,
      ): Buganizer.Bug;
      setDependsOn(bugIds: string[]): Buganizer.Bug;
      setDuplicateOf(duplicateId: string): Buganizer.Bug;
      setEstimatedEffort(estimate: string): Buganizer.Bug;
      setFirstNote(note: string): Buganizer.Bug;
      setFirstNote(
        note: string,
        formattingMode: Buganizer.FormattingMode,
      ): Buganizer.Bug;
      setFoundIn(foundIns: string[]): Buganizer.Bug;
      setHotlistIds(hotlistIds: string[]): Buganizer.Bug;
      setInProd(inprod: boolean): Buganizer.Bug;
      setIssueStatus(status: Buganizer.IssueStatus): Buganizer.Bug;
      setMarkdownNote(note: string): Buganizer.Bug;
      setNote(note: string): Buganizer.Bug;
      setNote(
        note: string,
        formattingMode: Buganizer.FormattingMode,
      ): Buganizer.Bug;
      setParents(bugIds: string[]): Buganizer.Bug;
      setPriority(bugPriority: Buganizer.Priority): Buganizer.Bug;
      setPriority(priority: string): Buganizer.Bug;
      setRepeatedCustomField(
        field: Buganizer.CustomField | string,
        value: string[],
      ): Buganizer.Bug;
      setReporter(reporter: string): Buganizer.Bug;
      setSendEmails(sendEmail: boolean): Buganizer.Bug;
      setSeverity(bugSeverity: Buganizer.Severity): Buganizer.Bug;
      setSeverity(severity: string): Buganizer.Bug;
      setSloStartsOn(sloStartsOn: Date): Buganizer.Bug;
      setStatusUpdate(note: string): Buganizer.Bug;
      setStatusUpdate(
        note: string,
        formattingMode: Buganizer.FormattingMode,
      ): Buganizer.Bug;
      setSummary(summary: string): Buganizer.Bug;
      setTargetedTo(targetedTos: string[]): Buganizer.Bug;
      setType(bugType: Buganizer.Type): Buganizer.Bug;
      setType(type: string): Buganizer.Bug;
      setVerifiedIn(verifiedIns: string[]): Buganizer.Bug;
      setVerifier(verifier: string): Buganizer.Bug;
    }

    interface BugHistory {
      getBug(): Buganizer.Bug;
      getHistory(): Buganizer.BugHistoryEvent[];
    }

    interface BugHistoryEvent {
      getAction(): string;
      getAddedBlockingIds(): string[];
      getAddedCCs(): string[];
      getAddedChangelists(): string[];
      getAddedDependsOnIds(): string[];
      getAddedDuplicateIds(): string[];
      getAddedFoundIn(): string[];
      getAddedHotlistIds(): string[];
      getAddedNotes(): string[];
      getAddedTargetedTo(): string[];
      getAddedVerifiedIn(): string[];
      getBugId(): string;
      getModifiedCustomFields(): Buganizer.CustomField[];
      getModifiedTime(): Date;
      getNewAssignee(): string;
      getNewBugType(): string;
      getNewCanonicalId(): string;
      getNewComponentId(): string;
      getNewPriority(): string;
      getNewReporter(): string;
      getNewResolution(): string;
      getNewSeverity(): string;
      getNewStatus(): string;
      getNewSummary(): string;
      getNewVerifier(): string;
      getRemovedBlockingIds(): string[];
      getRemovedCCs(): string[];
      getRemovedChangelists(): string[];
      getRemovedDependsOnIds(): string[];
      getRemovedDuplicateIds(): string[];
      getRemovedFoundIn(): string[];
      getRemovedHotlistIds(): string[];
      getRemovedTargetedTo(): string[];
      getRemovedVerifiedIn(): string[];
      getUserPerformingAction(): string;
      getVersion(): string;
    }

    interface BugFilingOptions {
      reporter?: string;
      note?: string;
      hotlistId?: number[];
      changelist?: string[];
      assignee?: string;
      verifier?: string;
      cc?: string[];
      type?: Buganizer.Type;
      priority?: Buganizer.Priority;
      severity?: Buganizer.Severity;
      blocking?: number[];
      dependsOn?: number[];
      foundIn?: string[];
      targetedTo?: string[];
      verifiedIn?: string[];
      inProd?: boolean;
      noteFormat?: Buganizer.FormattingMode | string;
      customFields?: { [key: string]: string };
    }

    // Implemented by
    // google3/java/com/google/apps/maestro/server/beans/buganizer/api/BugSlo.java
    interface BugSlo {
      getStartTime(): Date;
      getEndTime(): Date;
      getTargetTime(): Date;
    }

    enum IssueStatus {
      NEW,
      ASSIGNED,
      ACCEPTED,
      FIXED,
      VERIFIED,
      NOT_REPRODUCIBLE,
      INTENDED_BEHAVIOR,
      OBSOLETE,
      INFEASIBLE,
      DUPLICATE,
    }

    // DEPRECATED - use setIssueStatus
    enum Action {
      ACCEPT,
      ASSIGN,
      ASSIGN_VERIFIER,
      CREATE,
      DUPLICATE,
      FIXED_ACTION,
      FIX_LATER_ACTION,
      FIX_NOW,
      IGNORE_THIS_ISSUE,
      NOT_FEASIBLE,
      NOT_REPEATABLE,
      OBSOLETE,
      REASSIGN,
      REASSIGN_VERIFIER,
      REOPEN,
      REQUEST_CLARIFICATION,
      SAVE,
      STILL_NOT_FIXED,
      UNACCEPT,
      UNASSIGN,
      UNASSIGN_VERIFIER,
      VERIFY,
      WORKS_AS_INTENDED,
    }

    enum Priority {
      P0,
      P1,
      P2,
      P3,
      P4,
    }

    enum Severity {
      S0,
      S1,
      S2,
      S3,
      S4,
    }

    enum Type {
      BUG,
      CUSTOMER_ISSUE,
      EPIC,
      FEATURE,
      FEATURE_REQUEST,
      INTERNAL_CLEANUP,
      MILESTONE,
      PORTFOLIO,
      PRIVACY_ISSUE,
      PROCESS,
      PROGRAM,
      PROJECT,
      STORY,
      TASK,
      VULNERABILITY,
    }

    enum FormattingMode {
      PLAIN,
      MARKDOWN,
      LITERAL,
    }

    enum IssueView {
      BASIC,
      FULL,
    }

    interface Component {
      flush(): void;
      getAdmins(): string[];
      getBugs(): Buganizer.Bug[];
      getBugs(issueView: Buganizer.IssueView): Buganizer.Bug[];
      getBugs(children: boolean): Buganizer.Bug[];
      getBugs(
        children: boolean,
        issueView: Buganizer.IssueView,
      ): Buganizer.Bug[];
      getDescription(): string;
      getEffortSpec(): Buganizer.EffortSpec;
      getId(): string;
      getName(): string;
      getParentId(): string;
      setDescription(description: string): Buganizer.Component;
      setName(name: string): Buganizer.Component;
      getChildComponents(archived: boolean): Buganizer.Component[];
      getDefaultTemplate(): Buganizer.Template;
      getTemplates(): Buganizer.Template[];
    }

    interface CustomField {
      getId(): string;
      getName(): string;
      getValue(): string;
      getRepeatedValue(): string[];
    }

    interface Hotlist {
      flush(): void;
      getBugs(): Buganizer.Bug[];
      getBugs(issueView: Buganizer.IssueView): Buganizer.Bug[];
      getCreatedTime(): Date;
      getDescription(): string;
      getId(): string;
      getModifiedTime(): Date;
      getName(): string;
      getOwner(): string;
      getOwners(): string[];
      isArchived(): boolean;
      setArchived(archived: boolean): Buganizer.Hotlist;
      setDescription(description: string): Buganizer.Hotlist;
      setName(name: string): Buganizer.Hotlist;
      setOwner(owner: string): Buganizer.Hotlist;
      setOwners(owners: string[]): Buganizer.Hotlist;
    }

    interface Query {
      withAssignee(assignee: string): Buganizer.Query;
      withReporter(verifier: string): Buganizer.Query;
      withDateBetween(
        dateType: Buganizer.DateType,
        startDate: Date,
        endDate: Date,
      ): Buganizer.Query;
      execute(): Buganizer.Bug[];
    }

    interface Template {
      getTemplateId(): string;
      getComponentId(): string;
      getName(): string;
      getDescription(): string;
      getComment(): string;
      getType(): string;
      getPriority(): number;
      getSeverity(): number;
      getTitle(): string;
      getAssignee(): string;
      getVerifier(): string;
      getCC(): string[];
      getHotlistIds(): string[];
      getCustomFields(): Buganizer.CustomField[];
    }

    interface EffortSpec {
      getLabels(): string[];
      getName(): string;
    }

    enum DateType {
      CREATED,
      MODIFIED,
      RESOLVED,
      VERIFIED,
    }

    interface BugStaffing {
      getPlannedAllocations(): Buganizer.BugPlannedAllocation[];
      upsertUserAllocation(
        emailAddress: string,
        involvement: Buganizer.AllocationInvolvement,
      ): Buganizer.BugStaffing;
      upsertPlaceholderAllocation(
        role: Buganizer.JobRole,
        count: number,
      ): Buganizer.BugStaffing;
      removeUserAllocation(emailAddress: string): Buganizer.BugStaffing;
      removePlaceholderAllocation(
        role: Buganizer.JobRole,
      ): Buganizer.BugStaffing;
      clearAllocations(): Buganizer.BugStaffing;
    }

    interface BugPlannedAllocation {
      getEntityKind(): Buganizer.PlannedAllocationEntityKind;
      getUser(): string;
      getPlaceholder(): Buganizer.BugAllocatedPlaceholder;
      getBugAllocation(): Buganizer.BugAllocation;
    }

    interface BugAllocation {
      getAllocationKind(): Buganizer.AllocationKind;
      getInvolvement(): Buganizer.AllocationInvolvement;
      getAggregationValue(): number;
    }

    enum AllocationInvolvement {
      UNKNOWN,
      UNSPECIFIED,
      HIGH,
      MEDIUM,
      LOW,
      ZERO,
    }

    interface BugAllocatedPlaceholder {
      getRole(): Buganizer.JobRole;
      getCount(): number;
    }

    enum JobRole {
      UNKNOWN,
      UNSPECIFIED,
      SWE,
      SRE,
      PM,
      TPGM,
      UX,
    }

    enum PlannedAllocationEntityKind {
      UNKNOWN,
      USER,
      PLACEHOLDER,
    }

    enum AllocationKind {
      UNKNOWN,
      INVOLVEMENT,
    }
  }
}

declare var BuganizerApp: GoogleAppsScript.Buganizer.BuganizerApp;
