const fs = require('fs');
const path = '/Users/jade/hermes-agent/projects/jenny-eyelash-sms/jenny-eyelash-workflow.json';
let content = fs.readFileSync(path, 'utf8');

console.log('Before fix:');
const m = content.match(/QUO_FROM_PHONE.*?('\+147[^']+')/);
if (m) console.log('  Found:', m[1]);

// The asterisks are escaped as \* in the JSON string
// Fix: replace +147\+\+\+\+\+7979 (the escaped version) with +14793297979
content = content.split('+147\\*\\*\\*\\*7979').join('+14793297979');
content = content.split('+147\\\\*\\\\*\\\\*\\\\*7979').join('+14793297979');
content = content.split('+147\\*\\*\\*\\*7979').join('+14793297979');

fs.writeFileSync(path, content);
console.log('\nFile written');

// Verify
let verify = fs.readFileSync(path, 'utf8');
const data = JSON.parse(verify);

// Check all SMS nodes
const smsNodes = data.nodes.filter(n => n.name && n.name.includes('Send') && n.name.includes('SMS'));
console.log('\nSMS Nodes:');
smsNodes.forEach(n => {
  const params = n.parameters.bodyParameters?.parameters || [];
  const from = params.find(p => p.name === 'from');
  const body = params.find(p => p.name === 'body');
  console.log(' ', n.name);
  console.log('    from:', from?.value);
  console.log('    body param name:', body?.name);
});

// Check that no old masked phone remains in from fields
const badCount = (verify.match(/\+147\\*\\*\\*\\*7979/g) || []).length;
const goodCount = (verify.match(/\+14793297979/g) || []).length;
console.log('\nBad masked phone count:', badCount);
console.log('Good phone count:', goodCount);
console.log('Workflow active:', data.active);
