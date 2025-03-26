globalThis.DEBUG = true;

function addBugsToDomainHotlists() {
  globalThis._addBugsToDomainHotlists('created:10d status:open');
  globalThis._addBugsToDomainHotlists('(status:open | status:duplicate) thirtydayviewcount>1');
}
