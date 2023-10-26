export function clearScreen() {
    // https://stackoverflow.com/questions/9006988/node-js-on-windows-how-to-clear-console
    process.stdout.write("\x1Bc");
}
