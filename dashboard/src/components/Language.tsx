import {
  Dropdown,
  Button,
  DropdownPopover,
  DropdownMenu,
  DropdownItem,
  Label,
} from "@heroui/react";
import { LanguageIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

const languages = [
  { label: "English", value: "en" },
  { label: "فارسی", value: "fa" },
  { label: "简体中文", value: "zh-cn" },
  { label: "Русский", value: "ru" },
];

export const Language = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lang: string) => {
    void i18n.changeLanguage(lang);
  };

  return (
    <Dropdown>
      <Button isIconOnly size="sm" variant="outline" aria-label="language">
        <LanguageIcon className="size-4" />
      </Button>
      <DropdownPopover className="min-w-30">
        <DropdownMenu
          onAction={(key) => changeLanguage(String(key))}
          selectedKeys={[i18n.language]}
          selectionMode="single"
        >
          {languages.map((lang) => (
            <DropdownItem key={lang.value} id={lang.value} textValue={lang.label}>
              <Label>{lang.label}</Label>
            </DropdownItem>
          ))}
        </DropdownMenu>
      </DropdownPopover>
    </Dropdown>
  );
};
