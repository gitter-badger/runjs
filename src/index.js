import chalk from 'chalk';
import chProcess from 'child_process';
import _ from 'lodash';
import fs from 'fs';
import chokidar from 'chokidar';

export function call(obj, args, cons = console){
    let taskName = args[0];
    if(!taskName){
        cons.log('Available tasks:');
        Object.keys(obj).forEach((t) => {
            cons.log(t);
        });
        return;
    }

    Object.keys(obj).forEach((t) => {
        let task = obj[t];
        obj[t] = function(){
            let time = Date.now();
            cons.log(chalk.blue('Running "' + t + '"...'));
            task.apply(null, arguments);
            time = ((Date.now() - time) / 1000).toFixed(2);
            cons.log(chalk.blue('Finished "' + t +'" in', time, 'sec'));
        }
    });

    let task = obj[taskName];
    if(task){
        obj[taskName].apply(null, args.slice(1));
    }
    else {
        cons.log(chalk.red("Task " + taskName + " not found"));
    }
}

export function run(cmd, options){
    options = options || {};
    options.stdio = options.stdio || 'inherit';
    console.log(chalk.bold(cmd));
    cmd = 'PATH=$PATH:' + process.cwd() + '/node_modules/.bin/ ' + cmd;
    if(options.async){
        let child = chProcess.exec(cmd, options);
        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);
        return child;
    }
    return chProcess.execSync(cmd, options);
}

export function generate(src, dst, context){
    console.log(`Generating ${dst} from template ${src}`);
    let template = fs.readFileSync(src);
    let content = _.template(template)(context);
    fs.writeFileSync(dst, content);
}

export function watch(pattern, callback){
    console.log(`Watching files ${pattern}...`);
    let watcher = chokidar.watch(pattern, {ignoreInitial: true});
    watcher.on('change', (path) => {
        console.log(`File ${path} changed`);
        try {
            callback(path);
        } catch(e){

        }
    });

    watcher.on('add', (path) => {
        console.log(`File ${path} added`);
        try {
            callback(path);
        } catch(e){

        }
    });

    return watcher;
}