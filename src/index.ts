/**
 * The `Style` interface defines methods for managing styles within a Webflow project.
 * It allows for fetching styles either by name or as a collection, supporting asynchronous operations.
 */
interface Style {
  getStyleByName(name: string): Promise<null | Style>;
  getStyles(): Promise<Array<Style>>;
}

/**
 * The `Element` interface represents a webpage element in Webflow, with capabilities to manage its styles.
 * It offers methods to set or retrieve styles, access the currently selected element, and save the element's state.
 */

interface Element {
  styles?: Style[];
  setStyles: (styles: Style[]) => void;
  selectedElement: Promise<null | AnyElement>;
  getStyles(): Promise<Array<Style>>;
  save: () => Promise<void>;
}

/**
 * This asynchronous function applies a set of styles to the currently selected element in Webflow.
 * It creates a new style with the specified name and properties from the provided `styleObject`.
 * If no element is selected, it displays an error message. On success, it applies the style to the element
 * and shows a success message. Errors during the process are caught and displayed as error messages.
 *
 * @param {Object} styleObject - A key-value pair object defining CSS properties and values.
 * @param {string} styleName - The name for the new style to be created.
 * @returns {Promise<void>} - A promise that resolves with no value.
 */

async function applyStyles(
  styleObject: { [key: string]: string },
  styleName: string
): Promise<void> {
  const selectedElement = await webflow.getSelectedElement();

  if (!selectedElement) {
    displayFeedback("No element is currently selected.", "error");
    return;
  }

  try {
    let myStyle: Style = webflow.createStyle(styleName);
    myStyle.setProperties(styleObject);
    await myStyle.save();

    if (selectedElement.styles) {
      selectedElement.setStyles([myStyle]);
      await selectedElement.save();
      displayFeedback("Styles successfully applied!", "success");
    }
  } catch (error) {
    displayFeedback(`Error applying styles: ${error}`, "error");
  }
}

/**
 * Displays a feedback message on the webpage with color-coded styling based on the message type.
 * It targets an element with the id "feedbackMessage" to display the text.
 * The text color is set to red for errors and green for success messages.
 *
 * @param {string} message - The feedback message to be displayed.
 * @param {"error" | "success"} type - The type of the message determining the color of the text.
 */

function displayFeedback(message: string, type: "error" | "success"): void {
  const feedbackMessage = document.getElementById("feedbackMessage");
  feedbackMessage.textContent = message;
  feedbackMessage.style.color = type === "error" ? "red" : "green";
}

/**
 * Populates a dropdown element on the webpage with a list of common font families.
 * It creates and appends an option element for each font in the predefined list.
 * The dropdown is identified by the id "fontFamilyDropdown".
 * If the dropdown element is not found, no action is taken.
 */

function populateFontFamilyDropdown(): void {
  const fonts: string[] = [
    "Arial",
    "Verdana",
    "Helvetica",
    "Times New Roman",
    "Georgia",
    "Courier New",
  ];
  const fontFamilyDropdown: HTMLElement | null =
    document.getElementById("fontFamilyDropdown");

  fonts.forEach((font: string): void => {
    let option: HTMLOptionElement = document.createElement("option");
    option.value = font;
    option.textContent = font;
    fontFamilyDropdown?.appendChild(option);
  });
}

/**
 * Retrieves the font color value from either a hex color input or a color dropdown.
 * It first checks the value of a hex color input field, validating it against a hex color pattern.
 * If the hex color input is valid, its value is returned; otherwise, the function returns
 * the value from a color dropdown. The input field and dropdown are identified by their respective IDs.
 *
 * @returns {string} - The hex color value from the input field or the selected value from the dropdown.
 */

function getFontColorValue(): string {
  const hexColorInput: HTMLInputElement = document.getElementById(
    "fontColorHex"
  ) as HTMLInputElement;
  const colorDropdown: HTMLSelectElement = document.getElementById(
    "fontColorDropdown"
  ) as HTMLSelectElement;

  if (
    hexColorInput.value &&
    /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hexColorInput.value)
  ) {
    return hexColorInput.value;
  } else {
    return colorDropdown.value;
  }
}

/**
 * Asynchronously checks if the currently selected element in Webflow has a specific combo class.
 * It retrieves the styles of the selected element and searches for the specified combo class name.
 * Feedback is displayed to indicate whether the combo class exists or not.
 * Errors during the process are caught and an error message is displayed.
 *
 * @param {string} comboClassName - The name of the combo class to check for on the selected element.
 * @returns {Promise<void>} - A promise that resolves with no value.
 */

async function checkComboClass(comboClassName: string): Promise<void> {
  const selectedElement = await webflow.getSelectedElement();

  if (!selectedElement) {
    displayFeedback("No element is currently selected.", "error");
    return;
  }

  try {
    const styles: Style[] = selectedElement.getStyles();

    const hasComboClass = styles.some((style) => style.getName() === comboClassName);

    if (hasComboClass) {
      displayFeedback(`Combo class "${comboClassName}" exists.`, "success");
    } else {
      displayFeedback(`Combo class "${comboClassName}" does not exist.`, "error");
    }
  } catch (error) {
    displayFeedback(`Error checking for combo class: ${error}`, "error");
  }
}

/**
 * Sets up the initial state and event handlers when the DOM content is fully loaded.
 * It populates the font family dropdown and sets up click event listeners for the submit and check combo class buttons.
 * The submit button applies the selected styles (font size, color, and family) to the element,
 * creating a unique style name for each submission. The check combo class button checks if a specified
 * combo class exists on the currently selected element in Webflow. Each action provides appropriate feedback.
 */

document.addEventListener("DOMContentLoaded", function (): void {
  populateFontFamilyDropdown();

  const submitButton: HTMLElement | null = document.getElementById("submitStyles");
  let styleCounter: number = 0; // Counter to ensure unique style names

  submitButton?.addEventListener("click", async function (): Promise<void> {
    const fontSize: string = (
      document.getElementById("fontSizeDropdown") as HTMLSelectElement
    ).value;
    const fontColor: string = getFontColorValue();
    const fontFamily: string = (
      document.getElementById("fontFamilyDropdown") as HTMLSelectElement
    ).value;

    const styleName: string = `dynamicStyle${styleCounter++}`; // Unique style name for each submit
    await applyStyles(
      {
        "font-size": fontSize,
        color: fontColor,
        "font-family": fontFamily,
      },
      styleName
    );
  });

  const checkComboClassButton: HTMLElement | null =
    document.getElementById("checkComboClass");

  checkComboClassButton?.addEventListener("click", async function (): Promise<void> {
    const comboClassName: string = (
      document.getElementById("comboClassInput") as HTMLInputElement
    ).value;
    await checkComboClass(comboClassName);
  });
});
