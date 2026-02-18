Set Shell zsh
Set FontSize 16
# Set FontFamily "Monoflow"
Set Width 800
Set Height 600
Set LineHeight 1
Set Theme "Dracula+"
Set WindowBar Colorful
Set Padding 14
Set Margin 18
Set MarginFill "#9129d6"
Set BorderRadius 16
Set Framerate 24
Output demos/output/example.gif


Sleep 0.25s
Type "bun run packages/tui/src/index.tsx"
Enter
Wait+Screen /URL/
Sleep 1s

Set TypingSpeed 0.1

Type "https://jvg.omg.lol"
Enter
Sleep 1s
Down
Down
Down
Sleep 1s
Tab
Down
Down

Sleep 1s