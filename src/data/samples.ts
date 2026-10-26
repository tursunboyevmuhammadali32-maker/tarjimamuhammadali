export interface SampleText {
  title: string;
  lang: string;
  text: string;
}

export const SAMPLE_TEXTS: SampleText[] = [
  {
    title: "O'zbekcha (lotin) xatoli matn",
    lang: "uz-latn",
    text: "bugun man maktabga bormadm chunki boshim ogrib turuvdi lekin kitob larni oqip chiqdim . ertaga albatta boraman chunki dars lar juda qiziqarli boladi .",
  },
  {
    title: "O'zbekcha (kirill) xatoli matn",
    lang: "uz-cyrl",
    text: "бугун мен мактабга бормадим чунки бошим огриб турувди лекин китоб ларни укиб чикдим . эртага албатта бораман чунки дарс лар жуда кизикарли булади .",
  },
  {
    title: "Ruscha matn (Русский)",
    lang: "ru",
    text: "севодня я пашол в магазин но забыл денги дома . патом вернулся обратно и забрал их потомучто это было очень важно .",
  },
  {
    title: "Inglizcha matn (English)",
    lang: "en",
    text: "their is alot of mistake in this text and i dont no how to fix it . can you please help me to correct this grammatically .",
  },
];
