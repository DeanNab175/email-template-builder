export interface FontOption {
  label: string;
  value: string;
}

export interface GoogleFontOption extends FontOption {
  family: string;
  query: string;
}

export const systemFonts: FontOption[] = [
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  {
    label: "Helvetica Neue",
    value: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
  { label: "Georgia", value: "Georgia, 'Times New Roman', serif" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', Arial, sans-serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Tahoma", value: "Tahoma, Arial, sans-serif" },
  { label: "Courier New", value: "'Courier New', Courier, monospace" },
];

export const googleFonts: GoogleFontOption[] = [
  {
    label: "Inter",
    family: "Inter",
    query: "Inter:wght@400;500;600;700",
    value: "'Inter', Arial, sans-serif",
  },
  {
    label: "Roboto",
    family: "Roboto",
    query: "Roboto:wght@400;500;600;700",
    value: "'Roboto', Arial, sans-serif",
  },
  {
    label: "Open Sans",
    family: "Open Sans",
    query: "Open+Sans:wght@400;500;600;700",
    value: "'Open Sans', Arial, sans-serif",
  },
  {
    label: "Lato",
    family: "Lato",
    query: "Lato:wght@400;700",
    value: "'Lato', Arial, sans-serif",
  },
  {
    label: "Montserrat",
    family: "Montserrat",
    query: "Montserrat:wght@400;500;600;700",
    value: "'Montserrat', Arial, sans-serif",
  },
  {
    label: "Poppins",
    family: "Poppins",
    query: "Poppins:wght@400;500;600;700",
    value: "'Poppins', Arial, sans-serif",
  },
  {
    label: "Merriweather",
    family: "Merriweather",
    query: "Merriweather:wght@400;700",
    value: "'Merriweather', Georgia, serif",
  },
  {
    label: "Playfair Display",
    family: "Playfair Display",
    query: "Playfair+Display:wght@400;500;600;700",
    value: "'Playfair Display', Georgia, serif",
  },
  {
    label: "Nunito",
    family: "Nunito",
    query: "Nunito:wght@400;500;600;700",
    value: "'Nunito', Arial, sans-serif",
  },
  {
    label: "Source Sans 3",
    family: "Source Sans 3",
    query: "Source+Sans+3:wght@400;500;600;700",
    value: "'Source Sans 3', Arial, sans-serif",
  },
];

export const fontPresets = [...systemFonts, ...googleFonts];

export function getGoogleFont(fontFamily: string) {
  return googleFonts.find((font) => font.value === fontFamily);
}

export function getGoogleFontStylesheetUrl(fontFamily: string) {
  const font = getGoogleFont(fontFamily);
  return font
    ? `https://fonts.googleapis.com/css2?family=${font.query}&display=swap`
    : null;
}
