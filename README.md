# Linuxlens
Apple, Google, and Microsoft have their own AI search, why not make one for Linux. It's nowhere as good, but it's something. It has basic search (via DuckDuckGo) and website reading (uses Mozilla's library). I can't find an image model which also supports tools, so loading an image disables internet access.

## Setup
You'll also need to install [Ollama](https://ollama.com/download).
```bash
ollama pull llava:7b
ollama pull llama3.1:8b
git clone https://github.com/dispherical/linuxlens
cd linuxlens
npm install -g .
```

## Choosing your terminal
By default, it will assume you're using GNOME and will open the GNOME terminal. To use another terminal, like Konsole, use:

```bash
lens --terminal "konsole -e"
```

## Loading an image
```bash
lens --image <path>
```

## Keybinds
You can also invoke lens to ask questions about screenshots, like Google's circle to search.

| Screenshot Utility | Command                                                                                                                                    |
|--------------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| GNOME              | `gnome-screenshot -a && lens -i "$(find "$HOME/Pictures/Screenshots" -type f -printf "%T@ %p\n" \| sort -n \| tail -n 1 \| cut -d' ' -f2-)"` |
| Scrot              | `scrot /tmp/lens.png --select && /tmp/lens.png`                                                                                              |