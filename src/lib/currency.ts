export async function getDolarBlue() {
  try {
    const res = await fetch("https://dolarapi.com/v1/dolares/blue");
    if (!res.ok) throw new Error("Error fetching dolar rate");
    const data = await res.json();
    return data.venta as number;
  } catch (error) {
    console.error("Error fetching dolar:", error);
    return 1420; // Fallback to a reasonable value if API fails
  }
}
