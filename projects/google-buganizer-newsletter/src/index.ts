import { intlFormatDistance } from "date-fns";
import { BuganizerQuery, sortByVotes, WorkspaceQuery } from "@repository/buganizer-utils";

function searchAndSort(query: string, limit: number): GoogleAppsScript.Buganizer.Bug[] {
    return BuganizerApp.searchBugs(`-componentid:191645+ ${query}`).sort((a, b) => b.getMeTooCount() - a.getMeTooCount()).slice(0, limit);
}

const IGNORED_COMPONENTS = [
    "191651", // Sites API
]

const rootComponent = BuganizerApp.getComponentById(191625);

const RECENT_QUERY = new WorkspaceQuery(`created:30d`);
const OPEN_QUERY = new WorkspaceQuery(`status:open`);

const tables: {
    query: BuganizerQuery;
    limit: number;
    description: string;
    title: string;
}[] = [
        {
            query: RECENT_QUERY.and(`votecount>1 -status:duplicate`).minQuality(5),
            limit: 30,
            description: 'These are the issues having the most votes in the last 30 days.',
            title: 'Recent Notable Issues'
        },
        {
            query: OPEN_QUERY.and(`votecount>300`),
            limit: 10,
            description: 'These are the issues having the most votes.',
            title: 'Notable Open Issues'
        },
        {
            query: new BuganizerQuery(`status:open hotlistid:5181049 -status:duplicate`),
            limit: 10,
            description: 'These are the bugs that are currently blocking the corresponding public issue.',
            title: 'Blocked By'
        },
    ];

const componentTables = rootComponent.getChildComponents(false).filter(c => !IGNORED_COMPONENTS.includes(c.getId().toString())).map(c => ({
    query: RECENT_QUERY.and(`componentid:${c.getId()}+ votecount>0 -status:duplicate -status:obsolete`),
    limit: 10,
    description: `These are the issues having the most votes in the last 30 days for ${c.getName()}.`,
    title: `${c.getName()} Issues`
}));

function stats() {
    const bugs = searchAndSort(RECENT_QUERY.and(`votecount>1 -status:duplicate`).toString(), 1000);
    const tagNames = bugs.flatMap(b => {
        const tagsField = b.getAllCustomFields().find(f => f.getName() === 'tags');
        return tagsField?.getRepeatedValue().map(v => v.replace(/-api$/g, '')) || [];
    });
    const tagCounts = tagNames.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

    const componentNames = bugs.flatMap(b => [b.getComponentPath()[2]]);
    const componentCounts = componentNames.reduce((acc, component) => {
        acc[component] = (acc[component] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const sortedComponents = Object.entries(componentCounts).sort((a, b) => b[1] - a[1]);

    const assignees = bugs.flatMap(b => b.getAssignee()).filter(Boolean).map(a => a.split('@')[0]);
    const assigneeCounts = assignees.reduce((acc, assignee) => {
        acc[assignee] = (acc[assignee] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const sortedAssignees = Object.entries(assigneeCounts).sort((a, b) => b[1] - a[1]);

    const userEvents = BuganizerApp.getHistoryForBugIds(bugs.map(b => b.getId())).flatMap(h => h.getHistory().map(event => event.getUserPerformingAction()));
    const activeUsers = new Set(userEvents);

    const userDomains = Array.from(
        new Set(Array
            .from(activeUsers)
            .filter(u => Boolean(u) && !u.endsWith('@prod.google.com') && !u.endsWith('@google.com') && !u.endsWith('@gmail.com'))
            .map(u => u.split('@')[1])
        )
    ).sort((a, b) => a.split('.').reverse().join('.').localeCompare(b.split('.').reverse().join('.')));

    const userDomainsGroupedByTld = userDomains.reduce((acc, domain) => {
        const tld = domain.split('.').pop();
        if (!tld) return acc;
        acc[tld] = [...(acc[tld] || []), domain];
        return acc;
    }, {} as Record<string, string[]>);

    const userEventCounts = userEvents.filter(u => u.endsWith('@google.com')).map(a => a.split('@')[0]).reduce((acc, user) => {
        acc[user] = (acc[user] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const sortedUserEventCounts = Object.entries(userEventCounts).sort((a, b) => b[1] - a[1]);

    return {
        tags: sortedTags,
        components: sortedComponents,
        assignees: sortedAssignees,
        userDomainsGroupedByTld,
        sortedUserEventCounts,
    };
}

function queryLink(q: BuganizerQuery): string {
    return `http://b/?q=${encodeURIComponent(q.toString())}`
}

const BLUE = '#4285F4';
const WHITE = '#ffffff';

function buildHtml(): string {

    const { tags, components, assignees, userDomainsGroupedByTld, sortedUserEventCounts } = stats();

    const input = `
<mjml>
    <mj-head>
        <mj-preview>An overview ofrecent Workspace Developer issues g/workspace-devrel-public-issues-reports</mj-preview>
        <mj-title>Workspace Developer Issues</mj-title>
        <mj-breakpoint width="1400px" />
        <mj-style inline="inline">
            .title a {
                color: inherit !important;
                text-decoration: none !important;
            }
            .button a, .navbar-link a {
                color: white !important;
                text-decoration: none !important;
            }
            .bg-blue a {
                color: white !important;
            }
        </mj-style>
        <mj-attributes>
            <mj-divider border-color="${BLUE}" border-width="2px"/>
            <mj-button css-class="button" background-color="${BLUE}"/>
            <mj-navbar-link css-class="navbar-link" text-decoration="none" color="${WHITE}"/>
        </mj-attributes>
    </mj-head>
    <mj-body width="1400px">
        <mj-section background-color="${BLUE}" css-class="bg-blue">
            <mj-column>
                <mj-text font-size="30px" color="${WHITE}">Workspace Developer Public Issues</mj-text>
                <mj-text font-size="16px"color="${WHITE}" line-height="20px">An overview of the most recent public <a href="${RECENT_QUERY.b()}" target="_blank">Workspace Developer issues</a>. Subscribe at <a href="http://g/workspace-devrel-public-issues-reports" target="_blank">g/workspace-devrel-public-issues-reports</a>. Contact <a href="mailto:jpoehnelt@google.com" target="_blank">jpoehnelt@google.com</a> (<a href="http://who/jpoehnelt" target="_blank">who/jpoehnelt</a>) with questions or feedback.</mj-text>
                </mj-column>
            <mj-column>
                <mj-text font-size="20px" color="${WHITE}">🕵️ Go Directly to Buganizer: </mj-text>
               <mj-navbar align="left" hamburger="hamburger" ico-color="${WHITE}">
                  ${componentTables.map(t => `<mj-navbar-link padding="2px 15px" href="${t.query.b()}" target="_blank">${t.title}</mj-navbar-link>`).join('')}
                </mj-navbar>
            </mj-column>
        </mj-section>
        <mj-section>
            <mj-column width="80%">
            ${[...tables].map(t => {
        const bugs = t.query.search().sort(sortByVotes("DESC")).slice(0, 10);

        if (bugs.length === 0) {
            return '';
        }
        return `<mj-divider/>
                <mj-text css-class="title" font-size="20px">${t.title} - <code>${t.query}</code></mj-text>
                ${bugTable(bugs)}
                <mj-button><a href="${queryLink(t.query)}" target="_blank">👀 View More</a></mj-button>
                `}).join('')}
              </mj-column>
            <mj-column width="20%">
                <mj-divider/>
                <mj-text font-size="20px">🌐 By Domain</mj-text>
                <mj-text>These are the active domains <strong>in the last 30 days</strong>.</mj-text>
                <mj-text>
                    ${Object.values(userDomainsGroupedByTld).map(domains => `<ul style="padding-left: 5px;">${domains.map(domain =>
            `<li style="margin: 2px;">${domain.replace(/\./g, '&#173;.')}</li>`).join('')}</ul>`).join('')}</mj-text>
                <mj-divider/>
                <mj-text font-size="20px">📚 By Components</mj-text>
                <mj-text>These are the components with the most issues <strong>in the last 30 days</strong>.</mj-text>
                <mj-text><ul style="padding-left: 5px;">
                    ${components.slice(0, 10).map(([component, count]) =>
                `<li style="margin: 2px;">${component} (${count})</li>`).join('')}
                </ul></mj-text>
                <mj-divider/>
                <mj-text font-size="20px">🏷️ By Tags</mj-text>
                <mj-text>These are the tags having the most votes <strong>in the last 30 days</strong>.</mj-text>
                <mj-text><ul style="padding-left: 5px;">
                    ${tags.slice(0, 10).map(([tag, count]) =>
                    `<li style="margin: 2px;">${tag} (${count})</li>`).join('')}
                </ul></mj-text>
            </mj-column>
        </mj-section>
        <mj-section>
            <mj-column width="80%">
            ${[...componentTables].map(t => {
                        const bugs = t.query.search().sort(sortByVotes("DESC")).slice(0, 10);

                        if (bugs.length === 0) {
                            return '';
                        }
                        return `<mj-divider/>
                <mj-text css-class="title" font-size="20px">${t.title} - <code>${t.query}</code></mj-text>
                ${bugTable(bugs)}
                <mj-button><a href="${queryLink(t.query)}" target="_blank">👀 View More</a></mj-button>
                `}).join('')}
              </mj-column>
            <mj-column width="20%">
               <mj-text>Subscribe at <a href="http://g/workspace-devrel-public-issues-reports" target="_blank">g/workspace-devrel-public-issues-reports</a>. Contact <a href="mailto:jpoehnelt@google.com" target="_blank">jpoehnelt@google.com</a> (<a href="http://who/jpoehnelt" target="_blank">who/jpoehnelt</a>) with questions or feedback.</mj-text>
            </mj-column>
        </mj-section>
    </mj-body>
  </mjml>`;

    // @ts-ignore mjml is a library
    const { html, errors } = mjml.mjml2html(input);

    if (errors.length > 0) {
        console.log(input);
        throw new Error(JSON.stringify(errors, null, 2));
    }

    return html
}


function bugTable(bugs: GoogleAppsScript.Buganizer.Bug[]) {
    const columnStyle = 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: left;'

    return `
    <mj-table cellspacing="5" cellpadding="5">
      <tr>
        <th style="${columnStyle}"></th>
        <th style="${columnStyle}">Component</th>
        <th style="${columnStyle}">Title</th>
        <th style="${columnStyle}">Votes</th>
        <th style="${columnStyle}">Created</th>
        <th style="${columnStyle}">Status</th>
      </tr>
      ${bugs.map(b => `<tr>
        <td style="${columnStyle}">${typeToEmoji(b.getType())}</td>
        <td>${formatComponentPathSpan(b)}</td>
        <td>${formatBugSummaryLink(b)}</td>
        <td style="${columnStyle}">${b.getMeTooCount()}</td>
        <td style="${columnStyle}">${formatCreatedTime(b.getCreatedTime())}</td>
        <td style="${columnStyle}">${b.getStatus()}</td>
      </tr>`).join('')}
    </mj-table>`
}

function formatSummary(summary: string): string {
    return summary.replace("[Reported Externally]", "").trim();
}

function formatBugSummaryLink(b: GoogleAppsScript.Buganizer.Bug): string {
    return `<a href="https://issuetracker.google.com/${b.getId()}" target="_blank" title="${b.getSummary()}">${formatSummary(b.getSummary())}</a>`;
}

function formatCreatedTime(createdTime: Date): string {
    return intlFormatDistance(createdTime, new Date());
}

function formatComponentPathSpan(bug: GoogleAppsScript.Buganizer.Bug): string {
    const componentPath = bug.getComponentPath();
    return `<span title="${componentPath.join(' &gt; ')}">${[componentPath[0], "...", componentPath[componentPath.length - 1]].join(' &gt; ').replace("Locked", "").trim()}</span>`;
}


function typeToEmoji(type: string) {
    switch (type) {
        case 'bug':
            return '🐛';
        case 'feature_request':
            return '🚀';
        case 'customer_issue':
            return '💻';
        default:
            return '🤔';

    }
}

globalThis.buildHtml = buildHtml;



