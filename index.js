#!/usr/bin/node
const { exec } = require('child_process');
const { program } = require('commander');
program
  .option('-i, --image <char>')
  .option('-t, --terminal <char>');

function openTerminal(img) {
  const command = `${options.terminal || "gnome-terminal -- bash -c"} "
    node -e '
    const readline = require(\\"readline\\"); 
    const fs = require(\\"node:fs\\"); 
    const rl = readline.createInterface({input: process.stdin, output: process.stdout}); 
    var img = ${img ? `\\"${img}\\"` : null}

    if (img){
      if (!fs.existsSync(img)) {
      img = undefined
      console.log(\\"Failed to load image. Removing image from context.\\");
      } else {
       console.log(\\"Added image to context.\\");
      }
    }
    const askQuestion = () => {
      console.log(\\"✨ What do you want to ask?\\");
      
      rl.question(\\">> \\", async answer => { 
        console.log(\\"🔮 Processing...\\"); 
        const invoke = await require(\\"${__dirname}/invoke.js\\")({ text: answer, imagePath: img });
        console.log(invoke.content);
        askQuestion(); // Ask the question again
      });
    };
    
    process.on(\\"SIGTERM\\", () => {
      console.log(\\"Exiting...\\");
      rl.close();
      process.exit(0);
    });
    
    askQuestion();
    '
    exec bash;"`
  exec(command, (err) => {
    if (err) {
      console.error("Error opening terminal:", err);
    }
  });
}

program.parse();

const options = program.opts();

openTerminal(options.image)