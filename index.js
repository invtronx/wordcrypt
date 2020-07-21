const input = document.querySelector("#input");
const output = document.querySelector("#output");

const numEquivalent = "4-\u03B2-\u03C2-\u03B4-3-7-G-h-1-1-K-1-m-\u03B7-0-P-9-\u03D2-5-\u03C4-\u03BC-\u03C5-\u03C9-x-y-7".split(
  "-"
);
const costEquivalent = "2-2-1-0-1-2-1-0-1-2-0-0-0-1-0-3-1-0-2-2-1-0-1-0-0-2".split(
  "-"
);

/* chracter: [ characterEquivalent, cost ] */
const equivalent = {};

const alphabetCount = 26;
for (let inc = 0; inc < alphabetCount; inc = inc + 1) {
  const currentCharCode = "a".charCodeAt(0) + inc;
  equivalent[String.fromCharCode(currentCharCode)] = Array.of(
    numEquivalent[inc],
    parseInt(costEquivalent[inc])
  );
}

const replaceChar = (string, index, character) => {
  const charArray = string.split("");
  charArray[index] = character;
  return charArray.join("");
};

/* return a tuple containing the converted word and the corresponding cost */
const convertIndices = (word, start, increment) => {
  let copy = word,
    totalCost = 0;
  for (let i = start; i < word.length; i = i + increment) {
    if (!equivalent.hasOwnProperty(word[i])) {
      continue;
    }
    const [converted, cost] = equivalent[word[i]];
    copy = replaceChar(copy, i, converted);
    totalCost = totalCost + cost;
  }
  return Array.of(copy, totalCost);
};

const convertEvenIndices = (word) => convertIndices(word, 0, 2);
const convertOddIndices = (word) => convertIndices(word, 1, 2);
const convertAll = (word) => convertIndices(word, 0, 1);

const convertSparingly = (word) => {
  let copy = word,
    totalCost = 0;
  const shouldConvert = Array(word.length).fill(true);
  for (let i = 0; i < word.length; i = i + 1) {
    if (!equivalent.hasOwnProperty(word[i])) {
      continue;
    }
    const [converted, cost] = equivalent[word[i]];
    if (cost === 0 || !shouldConvert[i]) {
      continue;
    }
    copy = replaceChar(copy, i, converted);
    totalCost = totalCost + cost;
    if (
      equivalent.hasOwnProperty(word[i - 1]) &&
      equivalent[word[i - 1]][1] > 0
    ) {
      shouldConvert[i + 1] = false;
    }
  }
  return Array.of(copy, totalCost);
};

const convert = (stream) => {
  const convertedStream = stream
    .toLowerCase()
    .split(" ")
    .reduce((accumulatedWord, currentWord) => {
      const options = [
        convertSparingly,
        convertEvenIndices,
        convertOddIndices,
        convertAll,
      ];
      const optimalOption = options.reduce(
        (option, currentOption) => {
          const [convertedWord, currentCost] = currentOption(currentWord);
          return currentCost < option[1] && convertedWord !== currentWord
            ? currentOption(currentWord)
            : option;
        },
        ["", 1024]
      );
      const optimalWord = optimalOption[0];
      return `${accumulatedWord}${optimalWord} `;
    }, "");
  return convertedStream;
};

const copyTextToClipboard = (text) => {
  const textArea = document.createElement("textarea");

  textArea.style.position = "fixed";
  textArea.style.top = 0;
  textArea.style.left = 0;
  textArea.style.width = "2em";
  textArea.style.height = "2em";
  textArea.style.padding = 0;
  textArea.style.border = "none";
  textArea.style.outline = "none";
  textArea.style.boxShadow = "none";
  textArea.style.background = "transparent";

  textArea.value = text;

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand("copy");
    const msg = successful ? "successful" : "unsuccessful";
    console.log("Copying text command was " + msg);
  } catch (err) {
    console.log("Oops, unable to copy");
  }

  document.body.removeChild(textArea);
};

output.textContent = convert("Output");

input.addEventListener("input", (event) => {
  output.textContent = event.target.value
    ? convert(event.target.value) || convert("Output")
    : convert("Output");
});

output.addEventListener("click", () => {
  copyTextToClipboard(output.textContent);
});
