import fs from "fs";
import path from "path";
import https from "https";

const targetDir = path.resolve("client/public/images/courses");
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const images = [
  { name: "mern-full-stack.jpg", id: "photo-1633356122544-f134324a6cee" },
  { name: "react-frontend.jpg", id: "photo-1555066931-4365d14bab8c" },
  { name: "nodejs-backend.jpg", id: "photo-1558494949-ef010cbdcc31" },
  { name: "responsive-web-design.jpg", id: "photo-1507238691740-187a5b1d37b8" },
  { name: "java-programming.jpg", id: "photo-1517694712202-14dd9538aa97" },
  { name: "data-structures-algorithms.jpg", id: "photo-1509228468518-180dd4864904" },
  { name: "oop-design-patterns.jpg", id: "photo-1454165804606-c3d57bc86b40" },
  { name: "git-github-collaboration.jpg", id: "photo-1522071820081-009f0129c71c" },
  { name: "python-ai.jpg", id: "photo-1618005182384-a83a8bd57fbe" },
  { name: "machine-learning-fundamentals.jpg", id: "photo-1527474305487-b87b222841cc" },
  { name: "deep-learning-neural-networks.jpg", id: "photo-1507413245164-6160d8298b31" },
  { name: "generative-ai-llms.jpg", id: "photo-1620712943543-bcc4688e7485" },
  { name: "python-data-analysis.jpg", id: "photo-1551288049-bebda4e38f71" },
  { name: "sql-database-management.jpg", id: "photo-1544383835-bda2bc66a55d" },
  { name: "power-bi-data-visualization.jpg", id: "photo-1460925895917-afdab827c52f" },
  { name: "statistics-data-analysis.jpg", id: "photo-1509062522246-3755977927d7" },
  { name: "cloud-computing-fundamentals.jpg", id: "photo-1451187580459-43490279c0fa" },
  { name: "docker-containerization.jpg", id: "photo-1605745341112-85968b19335b" },
  { name: "cicd-github-actions.jpg", id: "photo-1618401471353-b98afee0b2eb" },
  { name: "aws-cloud-fundamentals.jpg", id: "photo-1544197150-b99a580bb7a8" },
  { name: "ui-ux-design-fundamentals.jpg", id: "photo-1581291518857-4e27b48ff24e" },
  { name: "figma-interface-design.jpg", id: "photo-1586717791821-3f44a563fa4c" },
  { name: "user-research-wireframing.jpg", id: "photo-1531403009284-440f080d1e12" },
  { name: "design-systems-prototyping.jpg", id: "photo-1581291518633-83b4ebd1d83e" },
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Status ${res.statusCode} for ${url}`));
      }
      const fileStream = fs.createWriteStream(dest);
      res.pipe(fileStream);
      fileStream.on("finish", () => {
        fileStream.close();
        resolve();
      });
      fileStream.on("error", reject);
    }).on("error", reject);
  });
}

async function run() {
  console.log(`Downloading ${images.length} course thumbnails...`);
  for (const item of images) {
    const dest = path.join(targetDir, item.name);
    const url = `https://images.unsplash.com/${item.id}?w=800&auto=format&fit=crop&q=80`;
    try {
      await downloadFile(url, dest);
      const stat = fs.statSync(dest);
      console.log(`✓ ${item.name} (${Math.round(stat.size / 1024)} KB)`);
    } catch (err) {
      console.error(`✗ Failed ${item.name}:`, err.message);
    }
  }
  console.log("Download complete.");
}

run();
