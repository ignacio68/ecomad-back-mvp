// Query strings can carry user coordinates (/nearby?lat=&lng=); never log them.
export const pathWithoutQuery = (url = "") => url.split("?")[0];
