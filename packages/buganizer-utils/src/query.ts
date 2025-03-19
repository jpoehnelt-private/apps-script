const EQ = ':';
const GT = '>';
const GTE = '>=';
const LT = '<';
const LTE = '<=';
const NEQ = '-';
const OR = ' | ';
const AND = ' ';


interface SearchOptions {
    sort?: (a: GoogleAppsScript.Buganizer.Bug, b: GoogleAppsScript.Buganizer.Bug) => number;
    limit?: number;
}

export class BuganizerQuery {
    constructor(protected query: string) { }

    clone(): this {
        const other = Object.create(Object.getPrototypeOf(this));
        other.query = this.query;
        return other as this;
    }

    and(query: string | BuganizerQuery): this {
        const clone = this.clone();
        clone.query = and(clone.query, query);
        return clone;
    }

    not(query: string | BuganizerQuery): this {
        const clone = this.clone();
        clone.query = `${this.query} ${not(query)}`;
        return clone;
    }

    or(query: string | BuganizerQuery): this {
        const clone = this.clone();
        clone.query = or(this.query, query);
        return clone;
    }

    gte(field: string, value: number): this {
        return this.and(`${field}${GTE}${value}`);
    }

    gt(field: string, value: number): this {
        return this.and(`${field}${GT}${value}`);
    }

    lte(field: string, value: number): this {
        return this.and(`${field}${LTE}${value}`);
    }

    lt(field: string, value: number): this {
        return this.and(`${field}${LT}${value}`);
    }

    eq(field: string, value: number | string): this {
        return this.and(`${field}${EQ}${value}`);
    }

    neq(field: string, value: number | string): this {
        return this.and(`-${field}${EQ}${value}`);
    }

    isStatus(status: string): this {
        return this.eq('status', status);
    }

    isComponent(component: string): this {
        return this.eq('componentid', component);
    }

    isAssignee(assignee: string): this {
        return this.eq('assignee', assignee);
    }

    toString(): string {
        return this.query;
    }

    search(): GoogleAppsScript.Buganizer.Bug[] {
        return BuganizerQuery.search(this.query);
    }

    static search(query: string | BuganizerQuery): GoogleAppsScript.Buganizer.Bug[] {
        let bugs: GoogleAppsScript.Buganizer.Bug[] = [];

        try {
            bugs = BuganizerApp.searchBugs(query.toString())

        } catch (e) {
            throw e;
        } finally {
            if ((globalThis as any).DEBUG) {
                Logger.log({
                    message: `BuganizerApp.searchBugs: "${query.toString()}" Found: ${bugs.length}`,
                    bugs: bugs.length
                });
            }
        }

        return bugs;
    }

    link(): string {
        return BuganizerQuery.link(this.query);
    }

    static link(query: string): string {
        return `https://issuetracker.google.com/issues?q=${encodeURIComponent(query)}`;
    }

    b(): string {
        return BuganizerQuery.b(this.query);
    }

    static b(query: string): string {
        return `http://b/?q=${encodeURIComponent(query)}`;
    }
}


export class WorkspaceQuery extends BuganizerQuery {
    constructor(query: string) {
        super(`componentid:191625+ ${query}`);
    }

    minQuality(value: number): this {
        return this.gte('customfield1388853', value);
    }

    maxQuality(value: number): this {
        return this.lte('customfield1388853', value);
    }

    notClassroom(): this {
        return this.neq('componentid', 191645);
    }

    isDeveloperIssue(bool: boolean): this {
        return this.eq('customfield1388852', bool ? 1 : 0);
    }

    isEnglish(bool: boolean): this {
        return this.eq('customfield1388884', bool ? 1 : 0);
    }

    isTaggedWith(tag: string): this {
        return this.eq('customfield1172495', tag);
    }

    isTaggedWithAny(tags: string[]): this {
        return this.and(`customfield1172495${EQ}${or(...tags)}`);
    }

    isTaggedWithAll(tags: string[]): this {
        return this.and(`customfield1172495${EQ}(${and(...tags)})`);
    }

    isTaggedWithNone(tags: string[]): this {
        return this.not(`customfield1172495${EQ}${or(...tags)}`);
    }
}


function or(...queries: (string | BuganizerQuery)[]): string {
    const joined = queries.map(q => q.toString()).join(OR);
    if (joined.includes(AND)) {
        return `(${joined})`;
    }

    return joined;
}

function and(...queries: (string | BuganizerQuery)[]): string {
    return `${queries.map(q => q.toString()).join(AND)}`;
}

function not(query: string | BuganizerQuery): string {
    const q = query.toString();

    // ignore nested ANDs
    const nestedAnds = q.match(/\(.*?\)/g) || [];
    const cleaned = nestedAnds.reduce((acc, and) => acc.replace(and, ''), q);
    if (cleaned.includes(AND)) {
        return `${NEQ}(${q})`;
    }

    return `${NEQ}${q}`;
}


type Direction = "ASC" | "DESC";

export function sortByVotes(direction: Direction) {
    return (a: GoogleAppsScript.Buganizer.Bug, b: GoogleAppsScript.Buganizer.Bug): number => {
        return direction === 'DESC' ? b.getMeTooCount() - a.getMeTooCount() : a.getMeTooCount() - b.getMeTooCount();
    };
}


