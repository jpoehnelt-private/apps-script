declare module "mjml" {
    export function mjml2html(mjml: string): { html: string };
}

declare global {
    var buildHtml: () => string;
    namespace BuganizerApp {
        // Enums
        enum Priority {
            P0 = "P0",
            P1 = "P1",
            P2 = "P2",
            P3 = "P3",
            P4 = "P4"
        }

        enum IssueStatus {
            NEW = "NEW",
            ASSIGNED = "ASSIGNED",
            ACCEPTED = "ACCEPTED",
            FIXED = "FIXED",
            VERIFIED = "VERIFIED",
            DUPLICATE = "DUPLICATE",
            WONTFIX = "WONTFIX",
            OBSOLETE = "OBSOLETE"
        }

        enum Severity {
            S0 = "S0",
            S1 = "S1",
            S2 = "S2",
            S3 = "S3",
            S4 = "S4"
        }

        enum Type {
            BUG = "bug",
            CUSTOMER_ISSUE = "customer_issue",
            EPIC = "epic",
            FEATURE = "feature",
            FEATURE_REQUEST = "feature_request",
            INTERNAL_CLEANUP = "internal_cleanup",
            MILESTONE = "milestone",
            PORTFOLIO = "portfolio",
            PRIVACY_ISSUE = "privacy_issue",
            PROCESS = "process",
            PROGRAM = "program",
            PROJECT = "project",
            STORY = "story",
            TASK = "task",
            VULNERABILITY = "vulnerability"
        }

        enum AllocationInvolvement {
            HIGH = "HIGH",
            MEDIUM = "MEDIUM",
            LOW = "LOW",
            ZERO = "ZERO",
            UNSPECIFIED = "UNSPECIFIED",
            UNKNOWN = "UNKNOWN"
        }

        enum AllocationKind {
            INVOLVEMENT = "INVOLVEMENT",
            UNKNOWN = "UNKNOWN"
        }

        enum PlannedAllocationEntityKind {
            USER = "USER",
            PLACEHOLDER = "PLACEHOLDER",
            UNKNOWN = "UNKNOWN"
        }

        enum JobRole {
            PM = "PM",
            SRE = "SRE",
            SWE = "SWE",
            TPGM = "TPGM",
            UX = "UX",
            UNSPECIFIED = "UNSPECIFIED",
            UNKNOWN = "UNKNOWN"
        }

        enum IssueView {
            BASIC = "BASIC",
            FULL = "FULL"
        }

        enum FormattingMode {
            PLAIN_TEXT = "PLAIN_TEXT",
            MARKDOWN = "MARKDOWN"
        }

        // Interfaces for custom objects
        interface CustomField {
            getId(): string;
            getName(): string;
            getValue(): string;
            getRepeatedValue(): string[];
           
        }

        interface CreateBugData {
            componentId: string;
            summary: string;
            reporter?: string;
            note?: string;
            hotlistId?: string[];
            changelist?: string[];
            assignee?: string;
            verifier?: string;
            cc?: string[];
            type?: Type;
            priority?: string | Priority;
            severity?: string | Severity;
            blocking?: string[];
            dependsOn?: string[];
            foundIn?: string[];
            targetedTo?: string[];
            verifiedIn?: string[];
            inProd?: boolean;
            customFields?: { [key: string]: any };
            noteFormat?: string | FormattingMode;
        }

        interface CreateHotlistData {
            name: string;
            description: string;
        }

        interface CreateComponentData {
            parentId: number;
            name: string;
            description?: string;
        }

        interface CreateSavedSearchData {
            name: string;
            query: string;
        }

        interface BugSlo {
            getEndTime(): Date;
            getStartTime(): Date;
            getTargetTime(): Date;
        }

        interface BugAllocatedPlaceholder {
            getRole(): JobRole;
            getCount(): number;
        }

        interface BugAllocation {
            getAllocationKind(): AllocationKind;
            getInvolvement(): AllocationInvolvement;
            getAggregationValue(): number;
        }

        interface BugPlannedAllocation {
            getEntityKind(): PlannedAllocationEntityKind;
            getUser(): string;
            getPlaceholder(): BugAllocatedPlaceholder;
            getBugAllocation(): BugAllocation;
        }

        interface BugStaffing {
            getPlannedAllocations(): BugPlannedAllocation[];
            upsertUserAllocation(emailAddress: string, involvement: AllocationInvolvement): BugStaffing;
            upsertPlaceholderAllocation(role: JobRole, count: number): BugStaffing;
            removeUserAllocation(emailAddress: string): BugStaffing;
            removePlaceholderAllocation(role: JobRole): BugStaffing;
            clearAllocations(): BugStaffing;
        }

        interface BugHistoryEvent {
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
            getModifiedCustomFields(): CustomField[];
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

        interface BugHistory {
            getBug(): Bug;
            getHistory(): BugHistoryEvent[];
        }

        interface Component {
            flush(): void;
            getAdmins(): string[];
            getBugs(): Bug[];
            getBugs(issueView: IssueView): Bug[];
            getId(): string;
            getDescription(): string;
            getName(): string;
            getPath(): string;
            getParentId(): string;
            getOwners(): string[];
            getChildren(): Component[];
            setAdmins(admins: string[]): Component;
            setDescription(description: string): Component;
            setName(name: string): Component;
            setOwners(owners: string[]): Component;
        }

        interface Hotlist {
            addBug(bugId: string): Hotlist;
            addBugs(bugIds: string[]): Hotlist;
            addEditor(editor: string): Hotlist;
            addOwner(owner: string): Hotlist;
            flush(): void;
            getBugs(): Bug[];
            getBugs(issueView: IssueView): Bug[];
            getDescription(): string;
            getEditors(): string[];
            getId(): string;
            getName(): string;
            getOwners(): string[];
            removeBug(bugId: string): Hotlist;
            removeBugs(bugIds: string[]): Hotlist;
            removeEditor(editor: string): Hotlist;
            removeOwner(owner: string): Hotlist;
            setDescription(description: string): Hotlist;
            setName(name: string): Hotlist;
        }

        interface SavedSearch {
            getId(): string;
            getName(): string;
            getQuery(): string;
            getBugs(): Bug[];
            getBugs(issueView: IssueView): Bug[];
            setName(name: string): SavedSearch;
            setQuery(query: string): SavedSearch;
            flush(): void;
        }

        interface Bug {
            toString: () => string;
            getStatus: () => string;
            getCollaborators: () => string[];
            removeCollaborator: (collaborator: string) => void;
            addCollaborator: (collaborator: string) => void;
            setVerifier: (verifier: string) => void;
            getStatusUpdate: () => string;
            setSeverity: (severity: string | Severity) => Bug;
            addChild: (child: string | Bug) => Bug;
            getSummary: () => string;
            setSummary: (summary: string) => Bug;
            removeFromHotlist: (hotlist: string | Hotlist) => Bug;
            getChildIssueCount: () => number;
            getResolvedTime: () => Date;
            getVerifiedTime: () => Date;
            getCustomFields: () => CustomField[];
            getAllCustomFields: () => CustomField[];
            getHotlistIds: () => string[];
            getCreatedTime: () => Date;
            getComponentId: () => string;
            getModifiedTime: () => Date;
            getVerifiedIn: () => string[];
            setMarkdownNote: (note: string) => Bug;
            setFirstNote: (note: string) => Bug;
            setChangelists: (changelists: string[]) => Bug;
            getPostmortems: () => string[];
            setDependsOn: (dependsOn: string[]) => Bug;
            addDependsOn: (dependsOn: string | string[]) => Bug;
            addBlocking: (blocking: string | string[]) => Bug;
            removeVerifiedIn: (verifiedIn: string) => Bug;
            setSloStartsOn: (sloStartsOn: Date) => Bug;
            getStatusUpdateAuthor: () => string;
            getVerifier: () => string;
            getComponentPath: () => string[];
            removeChangelist: (changelist: string) => Bug;
            getAssignee: () => string;
            getResolution: () => string;
            setStatusUpdate: (statusUpdate: string, formattingMode?: FormattingMode) => Bug;
            getDependsOn: () => string[];
            getFoundIn: () => string[];
            getReporter: () => string;
            addToHotlist: (hotlist: string | Hotlist) => Bug;
            removeChild: (child: string | Bug) => Bug;
            removeTargetedTo: (targetedTo: string | string[]) => Bug;
            getTargetedTo: () => string[];
            setIssueStatus: (status: IssueStatus) => Bug;
            getMeTooCount: () => number;
            addTargetedTo: (targetedTo: string | string[]) => Bug;
            setCollaborators: (collaborators: string[]) => Bug;
            setAssignee: (assignee: string) => Bug;
            addChangelist: (changelist: string) => Bug;
            setTargetedTo: (targetedTo: string[]) => Bug;
            getStaffing: () => BugStaffing;
            removeParent: (parent: string | Bug) => Bug;
            setSloEndTime: (sloEndTime: Date) => Bug;
            getEstimatedEffort: () => number;
            setEstimatedEffort: (estimatedEffort: number) => Bug;
            getDuplicateOf: () => string;
            setRepeatedCustomField: (name: string | CustomField, values: string[]) => Bug;
            getBlocking: () => string[];
            getSloStartsOn: () => Date;
            setBlocking: (blocking: string[]) => Bug;
            getAllCustomFields: () => { [key: string]: any };
            setComponentPath: (componentPath: string) => Bug;
            setChildren: (children: string[] | Bug[]) => Bug;
            getFirstNote: () => string;
            addFoundIn: (foundIn: string | string[]) => Bug;
            getClosureSlo: () => BugSlo;
            setHotlistIds: (hotlistIds: string[]) => Bug;
            getAncestors: () => { [childId: string]: string[] };
            getDescendants: () => { [parentId: string]: string[] };
            getDescendants: (depthLimit: number) => { [parentId: string]: string[] };
            getStatusUpdatedTime: () => Date;
            setFoundIn: (foundIn: string[]) => Bug;
            repositionInHotlist: (hotlist: string | Hotlist, position: number) => Bug;
            getAssignmentSlo: () => BugSlo;
            setVerifiedIn: (verifiedIn: string[]) => Bug;
            removeFoundIn: (foundIn: string) => Bug;
            removeCC: (cc: string | string[]) => Bug;
            getIssueStatus: () => IssueStatus;
            removeBlocking: (blocking: string | string[]) => Bug;
            setSendEmails: (sendEmails: boolean) => Bug;
            addVerifiedIn: (verifiedIn: string | string[]) => Bug;
            setInProd: (inProd: boolean) => Bug;
            getInProd: () => boolean;
            getResponseSlo: () => BugSlo;
            removeDependsOn: (dependsOn: string | string[]) => Bug;
            setDuplicateOf: (duplicateOf: string) => Bug;
            setParents: (parents: string[] | Bug[]) => Bug;
            setComponentId: (componentId: string) => Bug;
            setReporter: (reporter: string) => Bug;
            setNote: (note: string, formattingMode?: FormattingMode) => Bug;
            getCC: () => string[];
            addCC: (cc: string | string[]) => Bug;
            setCC: (cc: string[]) => Bug;
            addParent: (parent: string | Bug) => Bug;
            getEstimatedEffortTotalComplete: () => number;
            getEstimatedEffortTotalOpen: () => number;
            setCustomField: (name: string | CustomField, value: any) => Bug;
            getChangelists: () => string[];
            getParents: () => Bug[];
            getHistory: () => BugHistory;
            setType: (type: Type | string) => Bug;
            isOpen: () => boolean;
            setPriority: (priority: Priority | string) => Bug;
            getPriority: () => string;
            getId: () => string;
            save: () => Bug;
            getType: () => Type;
            getContents: () => string[];
            getChildren: () => Bug[];
            getSeverity: () => string;
        }

        // Global functions
        function searchBugs(query: string): Bug[];
        function getBugs(ids: string[]): Bug[];
        function getBugs(ids: string[], issueView: IssueView): Bug[];
        function createQuery(query: string): void;
        function getSavedSearchObject(id: string): SavedSearch;
        function getHistoryForBugIds(ids: string[]): BugHistory[];
        function getHistoryForBugs(bugs: Bug[]): BugHistory[];
        function createBug(componentId: string, summary: string): Bug;
        function createBug(componentId: string, summary: string, reporter: string, note: string): Bug;
        function createBug(componentId: string, summary: string, options: CreateBugData): Bug;
        function searchHotlists(query: string): Hotlist[];
        function searchComponents(query: string): Component[];
        function getComponentById(id: string): Component;
        function getComponentByPath(path: string): Component;
        function createSavedSearch(data: CreateSavedSearchData): SavedSearch;
        function createHotlist(name: string, description: string): Hotlist;
        function createHotlist(data: CreateHotlistData): Hotlist;
        function getSavedSearch(id: string): SavedSearch;
        function createComponent(parentId: number, name: string): Component;
        function createComponent(parentId: number, name: string, description: string): Component;
        function createComponent(data: CreateComponentData): Component;
        function getHotlist(id: string): Hotlist;
        function getBug(id: string): Bug;
    }
}
export { };
