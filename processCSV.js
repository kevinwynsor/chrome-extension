const fs = require("fs");

const input = fs.readFileSync("posts.csv", "utf8");
const rows = input.split("\n").slice(1);

let output = "title,poster,tag,body,score\n";

rows.forEach(row => {
    if (!row.trim()) return;

    const match = row.match(/^"(.+?)","(.+?)"$/);
    if (!match) return;

    const post = match[1];
    const score = match[2];

    // poster
    const userMatch = post.match(/u\/[A-Za-z0-9_-]+/);
    const poster = userMatch ? userMatch[0] : "n/a";

    // title (before username)
    const title = userMatch ? post.split(poster)[0].trim() : "n/a";

    // remove duplicated title section
    let remaining = post.slice(post.indexOf(poster) + poster.length);

    // remove timestamp like "• 7 min. ago"
    remaining = remaining.replace(/.*?ago/, "").trim();

    // remove duplicated title again
    if (remaining.startsWith(title)) {
        remaining = remaining.slice(title.length).trim();
    }

    // tag detection
    const tagMatch = remaining.match(/(Item for sale|Item wanted|Hiring|Need a job|Where do I find...)/i);
    const tag = tagMatch ? tagMatch[0] : "n/a";

    let body = "";
    if (tagMatch) {
        body = remaining.slice(remaining.indexOf(tag) + tag.length).trim();
    }

    output += `"${title}","${poster}","${tag}","${body}","${score}"\n`;
});

fs.writeFileSync("processed_posts.csv", output);

console.log("Processed CSV saved.");