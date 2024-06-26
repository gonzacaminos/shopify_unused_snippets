require('dotenv').config();
const fs = require('fs');
const path = require('path');
const searchFile = require('search-in-file');
const process = require('process');
const cliSelect = require('cli-select');

if(!process.env.SHOPIFY_ROOT){
    console.log(`Your SHOPIFY_ROOT .env variable isn't set.`);
    return false
}

const root = path.resolve(__dirname, process.env.SHOPIFY_ROOT);

if (!fs.existsSync(root)) {
  console.log(`Your root directory at '${root}' doesn't exist.`);
  return false;
}

const config = {
    assets: path.join(root, './assets'),
    layouts: path.join(root, './layout'),
    templates: path.join(root, './templates'),
    templates_customers: path.join(root, './templates/customers'),
    sections: path.join(root, './sections'),
    snippets: path.join(root, './snippets'),
}

const filesIndir = (dir) => fs.readdirSync(dir).map((v) => ( {file:v, path: path.join(dir, v)} ))

async function findFile(e){
    return searchFile.fileSearch(Object.values(config), e.file.replace('.liquid', '')).then( result => {
        return {
            file: e.file,
            result: result || 0
        }
    })
}

function checkFiles(type) {

    console.log(`Checking for your unused ${type}..`)
    const files = filesIndir(config[type])
  
    Promise.all(files.map(e => findFile(e))).then(data => {
     
        const unused = data.filter(s => !s.result.length);

        try {
            fs.writeFileSync(`./data/${type}.json`, JSON.stringify(data, null, 2), 'utf8');
        } catch (error) {
            console.log('An error has occurred report file.', error);
        }

        try {
            fs.writeFileSync(`./data/unused_${type}.json`, JSON.stringify({ unused: unused }, null, 2), 'utf8');
        } catch (error) {
            console.log('An error has occurred writing your unused report file.', error);
        }

        console.log(`Finished reporting your ${type} files. found ${unused.length} unused.`)

        if(unused.length > 0){
            console.log(`Do you want to delete you unused ${type}?`)
            cliSelect({
                values: ['no', 'yes'],
                valueRenderer: (value, selected) => {
                    return value;
                },
            }).then((response) => {
                if(response.value === 'yes'){
                    console.log('Deleting...');
                    unused.forEach( unused_file => {
                        try {
                            const file_path = path.resolve(config[type], unused_file.file)
                            fs.unlinkSync(file_path);
                            console.log(`- Deleted ${unused_file.file} at ${file_path}`);
                        } catch (err) {
                            console.error(err);
                        }
                    })
                }
            }).catch(() => {
                console.log('Deletion cancelled');
            });
        }
    })
}

 
cliSelect({
    values: ['assets', 'sections', 'snippets'],
    valueRenderer: (value, selected) => {
        return value;
    },
}).then((response) => {
    console.log('Selected: ' + response.value);
    checkFiles(response.value)
}).catch(() => {
    console.log('Selection cancelled');
});