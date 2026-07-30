import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/data/site";

export const alt = "Ameen Haieck — Graphic Designer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Params = { locale: string };

export default async function Image({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const isAr = locale === "ar";

  const [regular, bold] = await Promise.all([
    readFile(join(process.cwd(), "fonts/itf-qomra-arabic/ITFQomraArabic-Regular.otf")),
    readFile(join(process.cwd(), "fonts/itf-qomra-arabic/ITFQomraArabic-Bold.otf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#343131",
          backgroundImage:
            "radial-gradient(circle at 82% 18%, rgba(238,223,122,0.22), rgba(238,223,122,0) 55%)",
          direction: isAr ? "rtl" : "ltr",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 72,
            height: 72,
            borderRadius: 9999,
            backgroundColor: "rgba(238,223,122,0.14)",
            color: "#eedf7a",
            fontSize: 26,
            fontWeight: 700,
            fontFamily: "Qomra",
          }}
        >
          {siteConfig.monogram}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 44,
            fontSize: 68,
            fontWeight: 700,
            color: "#f6f3ec",
            fontFamily: "Qomra",
          }}
        >
          {t("titleShort")}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 22,
            fontSize: 30,
            color: "#eedf7a",
            fontFamily: "Qomra",
          }}
        >
          {isAr ? "مصمم جرافيك" : "Graphic Designer"}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            maxWidth: 880,
            fontSize: 24,
            lineHeight: 1.5,
            color: "rgba(246,243,236,0.65)",
            fontFamily: "Qomra",
          }}
        >
          {t("description")}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Qomra", data: regular, style: "normal", weight: 400 },
        { name: "Qomra", data: bold, style: "normal", weight: 700 },
      ],
    },
  );
}
