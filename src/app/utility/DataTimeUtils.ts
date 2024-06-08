
const options  = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: "3",
    hour12: false
};

// @ts-ignore
const dateTimeFormat = new Intl.DateTimeFormat('en-us', options);

export function GetDateForChunkInfo() {
    return dateTimeFormat.format(new Date())
}