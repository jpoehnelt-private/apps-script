import { formatDistance } from "date-fns";

const divider = '<mj-divider border-color="#4285F4" border-width="2px"/>';

function searchAndSort(query: string, limit: number): BuganizerApp.Bug[] {
    return BuganizerApp.searchBugs(`-componentid:191645+ ${query}`).sort((a, b) => b.getMeTooCount() - a.getMeTooCount()).slice(0, limit);
}

function relativeComponentPathSpan(bug: BuganizerApp.Bug): string {
    const componentPath = bug.getComponentPath();
    return `<span title="${componentPath.join(' &gt; ')}">${[componentPath[0], "...", componentPath[componentPath.length - 1]].join(' &gt; ')}</span>`;
}


function buildHtml(): string {

    const recentNotableBugs = searchAndSort(`componentid:191625+ created:30d votecount>1`, 100);
    const tags = recentNotableBugs.flatMap(b => b.getAllCustomFields().find(f => f.getName() === 'tags')?.getRepeatedValue().map(v => v.replace(/-api$/g, '')) || []);
    const tagCounts = tags.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
    console.log(sortedTags);

    const componentCounts = recentNotableBugs.flatMap(b => b.getComponentPath()[2]).reduce((acc, component) => {
        acc[component] = (acc[component] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const sortedComponents = Object.entries(componentCounts).sort((a, b) => b[1] - a[1]);
    console.log(sortedComponents);

    const assigneeCounts = recentNotableBugs.flatMap(b => b.getAssignee()).filter(Boolean).map(a => a.split('@')[0]).reduce((acc, assignee) => {
        acc[assignee] = (acc[assignee] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const sortedAssignees = Object.entries(assigneeCounts).sort((a, b) => b[1] - a[1]);
    console.log(sortedAssignees);

    const input = `
<mjml>
    <mj-head>
        <mj-preview>An overview of the most recent Workspace Developer issues</mj-preview>
        <mj-title>Workspace Developer Issues</mj-title>
        <mj-breakpoint width="1400px" />
    </mj-head>
    <mj-body width="1400px">
        <mj-section></mj-section>
        <mj-section>
            <mj-column width="80%">
                ${divider}
                <mj-text font-size="20px">🆕 Recent Notable Issues</mj-text>
                <mj-text>These are the issues having the most votes in the last 30 days.</mj-text>
                ${bugTable(recentNotableBugs.slice(0, 10))}
                ${divider}
                <mj-text font-size="20px">🔥 Notable Open Issues</mj-text>
                <mj-text>These are the issues having the most votes.</mj-text>
                ${bugTable(searchAndSort(`status:open componentid:191625+ votecount>300`, 10))}
                ${divider}
                <mj-text font-size="20px">🛑 Blocked By</mj-text>
                <mj-text>These are the bugs that are currently blocking the corresponding public issue.</mj-text>
                ${bugTable(searchAndSort(`status:open hotlistid:5181049 created:30d`, 10))}
              </mj-column>
            <mj-column width="20%">
                ${divider}
                <mj-text font-size="20px">📚 By Components</mj-text>
                <mj-text>These are the components with the most issues <strong>in the last 30 days</strong>.</mj-text>
                <mj-text><ul style="padding-left: 5px;">
                    ${sortedComponents.slice(0, 10).map(([component, count]) =>
        `<li style="margin: 2px;">${component} (${count})</li>`).join('')}
                </ul></mj-text>
                ${divider}
                <mj-text font-size="20px">🏷️ By Tags</mj-text>
                <mj-text>These are the tags having the most votes <strong>in the last 30 days</strong>.</mj-text>
                <mj-text><ul style="padding-left: 5px;">
                    ${sortedTags.slice(0, 10).map(([tag, count]) =>
            `<li style="margin: 2px;">${tag} (${count})</li>`).join('')}
                </ul></mj-text>
                ${divider}
                <mj-text font-size="20px">👤 By Assignee</mj-text>
                <mj-text>These are the assignees with the most issues <strong>in the last 30 days</strong>.</mj-text>
                <mj-text><ul style="padding-left: 5px;">
                    ${sortedAssignees.map(([assignee, count]) =>
                `<li style="margin: 2px;"><a href="http://who/${assignee}" target="_blank">${assignee}</a> <a href="http://b/issues?q=assignee:${assignee}%20componentid:191625%2B%20created:30d" target="_blank">(${count})</a></li>`).join('')}
                </ul></mj-text>
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


function bugTable(bugs: BuganizerApp.Bug[]) {
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
        <td>${relativeComponentPathSpan(b)}</td>
        <td><a href="https://issuetracker.google.com/${b.getId()}" target="_blank" title="${b.getSummary()}">${b.getSummary()}</a></td>
        <td style="${columnStyle}">${b.getMeTooCount()}</td>
        <td style="${columnStyle}">${formatDistance(b.getCreatedTime(), new Date())}</td>
        <td style="${columnStyle}">${b.getStatus()}</td>
      </tr>`).join('')}
    </mj-table>`
}

function typeToEmoji(type: BuganizerApp.Type) {
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



