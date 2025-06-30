require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Supabase URL or Anon Key are not defined in environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const SUB_LINKS_DIR = path.join(__dirname, '../src/app/sub_links');
const PHYSICS_DIR = path.join(SUB_LINKS_DIR, 'physics');

// Helper: kebab-case
function toKebabCase(str) {
  return str.toLowerCase().replace(/\s+/g, '-');
}

// Helper: sanitize subject name for function name (remove non-alphanumeric, capitalize each word, ensure valid identifier)
function toComponentName(str) {
  // Remove all non-alphanumeric characters and split into words
  const words = str.replace(/[^a-zA-Z0-9 ]/g, ' ').split(' ').filter(Boolean);
  // Capitalize each word and join
  let compName = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  // If the first character is a digit, prefix with 'Subject'
  if (/^[0-9]/.test(compName)) {
    compName = 'Subject' + compName;
  }
  return compName;
}

// Helper: copy file with replacements, including function name
function copyTemplateFile(src, dest, replacements = {}, subjectName = null) {
  if (fs.existsSync(dest)) return false;
  let content = fs.readFileSync(src, 'utf8');
  // Add subject name replacements for 'Physics' and 'PHYSICS'
  if (subjectName) {
    replacements = {
      ...replacements,
      'Physics': subjectName,
      'PHYSICS': subjectName.toUpperCase(),
    };
  }
  // Skip replacements inside the 'subjects' array
  // Find the 'subjects' array and temporarily replace it with a placeholder
  let subjectsArrayMatch = content.match(/const subjects = \[[\s\S]*?\];/);
  let subjectsArrayPlaceholder = '__SUBJECTS_ARRAY__';
  let subjectsArray = null;
  if (subjectsArrayMatch) {
    subjectsArray = subjectsArrayMatch[0];
    content = content.replace(subjectsArray, subjectsArrayPlaceholder);
  }
  for (const [key, value] of Object.entries(replacements)) {
    const regex = new RegExp(key, 'g');
    content = content.replace(regex, value);
  }
  // Restore the original subjects array
  if (subjectsArray) {
    content = content.replace(subjectsArrayPlaceholder, subjectsArray);
  }
  // Special: Replace export default function name if subjectName is provided
  if (subjectName) {
    // Find 'export default function <Something>' and replace <Something> with sanitized name
    const compName = toComponentName(subjectName);
    content = content.replace(/export default function [A-Za-z0-9_]+/, `export default function ${compName}`);
  }
  fs.writeFileSync(dest, content, 'utf8');
  return true;
}

async function main() {
  // 1. Fetch all subjects from Supabase
  const { data: subjects, error } = await supabase
    .from('subjects')
    .select('name, syllabus_type');
  if (error) {
    console.error('Error fetching subjects:', error.message);
    process.exit(1);
  }

  // 2. List all subject folders in sub_links
  const existingFolders = fs.readdirSync(SUB_LINKS_DIR)
    .filter(f => fs.statSync(path.join(SUB_LINKS_DIR, f)).isDirectory());

  // 3. Build subject map: { kebabName: { name, syllabus_types: Set } }
  const subjectMap = {};
  for (const subj of subjects) {
    const kebab = toKebabCase(subj.name);
    if (!subjectMap[kebab]) subjectMap[kebab] = { name: subj.name, syllabus_types: new Set() };
    if (subj.syllabus_type) subjectMap[kebab].syllabus_types.add(subj.syllabus_type);
  }

  // 4. Find missing subjects
  const missingSubjects = Object.keys(subjectMap).filter(kebab => !existingFolders.includes(kebab));

  if (missingSubjects.length === 0) {
    console.log('No missing subject folders. All subjects are present.');
    return;
  }

  // 5. Prepare template paths
  const physicsPage = path.join(PHYSICS_DIR, 'page.jsx');
  const templateIAL = {
    communityNotes: path.join(PHYSICS_DIR, 'IAL/communityNotes/page.jsx'),
    resources: path.join(PHYSICS_DIR, 'IAL/resources/page.jsx'),
    pastpapers: path.join(PHYSICS_DIR, 'IAL/pastpapers/page.jsx'),
    lib: path.join(PHYSICS_DIR, 'IAL/lib/supabaseClient.js'),
  };
  const templateIGCSE = {
    communityNotes: path.join(PHYSICS_DIR, 'IGCSE/communityNotes/page.jsx'),
    resources: path.join(PHYSICS_DIR, 'IGCSE/resources/page.jsx'),
    pastpapers: path.join(PHYSICS_DIR, 'IGCSE/pastpapers/page.jsx'),
    lib: path.join(PHYSICS_DIR, 'IGCSE/lib/supabaseClient.js'),
  };

  // 6. Create missing folders/files
  for (const kebab of missingSubjects) {
    const subj = subjectMap[kebab];
    const subjDir = path.join(SUB_LINKS_DIR, kebab);
    fs.mkdirSync(subjDir, { recursive: true });
    // Main page.jsx
    copyTemplateFile(
      physicsPage,
      path.join(subjDir, 'page.jsx'),
      { Physics: subj.name, PHYSICS: subj.name.toUpperCase() },
      subj.name
    )
      ? console.log(`Created: ${kebab}/page.jsx`)
      : console.log(`Exists: ${kebab}/page.jsx`);

    for (const type of subj.syllabus_types) {
      const typeDir = path.join(subjDir, type);
      fs.mkdirSync(typeDir, { recursive: true });
      // Subfolders
      for (const folder of ['communityNotes', 'resources', 'pastpapers', 'lib']) {
        const folderPath = path.join(typeDir, folder);
        fs.mkdirSync(folderPath, { recursive: true });
      }
      // Files
      const template = type === 'IAL' ? templateIAL : templateIGCSE;
      copyTemplateFile(template.communityNotes, path.join(typeDir, 'communityNotes/page.jsx'), { Physics: subj.name, PHYSICS: subj.name.toUpperCase() }, subj.name)
        ? console.log(`Created: ${kebab}/${type}/communityNotes/page.jsx`)
        : console.log(`Exists: ${kebab}/${type}/communityNotes/page.jsx`);
      copyTemplateFile(template.resources, path.join(typeDir, 'resources/page.jsx'), { Physics: subj.name, PHYSICS: subj.name.toUpperCase() }, subj.name)
        ? console.log(`Created: ${kebab}/${type}/resources/page.jsx`)
        : console.log(`Exists: ${kebab}/${type}/resources/page.jsx`);
      copyTemplateFile(template.pastpapers, path.join(typeDir, 'pastpapers/page.jsx'), { Physics: subj.name, PHYSICS: subj.name.toUpperCase() }, subj.name)
        ? console.log(`Created: ${kebab}/${type}/pastpapers/page.jsx`)
        : console.log(`Exists: ${kebab}/${type}/pastpapers/page.jsx`);
      copyTemplateFile(template.lib, path.join(typeDir, 'lib/supabaseClient.js'))
        ? console.log(`Created: ${kebab}/${type}/lib/supabaseClient.js`)
        : console.log(`Exists: ${kebab}/${type}/lib/supabaseClient.js`);
    }
  }

  console.log('\nSummary:');
  console.log(`Checked ${Object.keys(subjectMap).length} subjects. Created ${missingSubjects.length} new subject folders.`);
}

main(); 