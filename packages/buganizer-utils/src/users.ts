
export function getBugUserEvents(bugIds: string[] | string): string[] {
    if (!Array.isArray(bugIds)) {
        bugIds = [bugIds];
    }
    return BuganizerApp.getHistoryForBugIds(bugIds).flatMap(h => h.getHistory().map(event => event.getUserPerformingAction())).filter(Boolean);
}