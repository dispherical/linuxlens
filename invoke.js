const { ChatOllama, } = require("@langchain/ollama")
const { HumanMessage, SystemMessage } = require("@langchain/core/messages")
const FileType = require('file-type');
const sharp = require('sharp');

module.exports = async function ({ text, imagePath, cb }) {
    let llm = new ChatOllama({
        model: imagePath ? "llava:7b" : "mistral:7b",
        temperature: 0,
        maxRetries: 2,
    });
    if (!imagePath)
        llm = llm.bindTools([
            require("./tools/search"),
            require("./tools/visit")
        ]);
    const humanMessageLoader = [{
        type: "text",
        text: text,
    }]
    const messages = [
        new SystemMessage("Your job is to give the user an answer as simply as possibly. This is a one time query so don't ask the human any questions but you are encouraged to use the tools given. Try and make it less than 150 characters and no extra line breaks, the screen is quite small. IMPORTANT: If you need more details after a search, please use the visit tool IN ADDITION to the search tool."),
        new HumanMessage({ content: humanMessageLoader })
    ];
    if (imagePath) {
        const imageData = await sharp(imagePath)
            .jpeg({ quality: 100 })
            .toBuffer()
        const mimeType = await FileType.fromBuffer(imageData)
        const base64Image = imageData.toString("base64");
        humanMessageLoader.push({
            type: "image_url",
            image_url: {
                url: `data:${mimeType.mime};base64,${base64Image}`
            }
        })
    }
    let completion = await llm.invoke(messages);
    const toolsByName = {
        search: require("./tools/search"),
        visit: require("./tools/visit"),
    };
    if (!imagePath) {
        while (completion.tool_calls && completion.tool_calls.length > 0) {
            for (const toolCall of completion.tool_calls) {
                const selectedTool = toolsByName[toolCall.name];
                console.log(`Invoking tool: ${toolCall.name}`);
                if (typeof cb == "function") cb({ type: "update", content: `Invoking tool: ${toolCall.name} (${toolCall.args.query || toolCall.args.url})` })
                const toolMessage = await selectedTool.invoke(toolCall);
                messages.push(toolMessage);
            }
            completion = await llm.invoke(messages);
        }
    }
    return { content: completion.content, type: "final" }
}