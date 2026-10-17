import ru from "../../../messages/ru.json";
import kk from "../../../messages/kk.json";
import en from "../../../messages/en.json";
import { mediaFields, type MediaKey, type SiteContent } from "./model";

export function createDefaultContent(): SiteContent {
  return {
    schemaVersion: 1,
    revision: "default",
    updatedAt: null,
    messages: structuredClone({ ru, kk, en }),
    media: Object.fromEntries(mediaFields.map(({ key, defaultSrc }) => [key, defaultSrc])) as Record<MediaKey, string>,
    settings: {
      phoneDisplay: "+7-(707)-321-41-77",
      phoneHref: "tel:+77073214177",
      email: "info@ipec-energy.com",
      mapUrl: "https://yandex.kz/maps/ru/-/CHhIyUZ1",
    },
  };
}
