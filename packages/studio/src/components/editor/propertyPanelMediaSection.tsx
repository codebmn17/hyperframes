import { Film, Music } from "../../icons/SystemIcons";
import type { DomEditSelection } from "./domEditing";
import {
  formatNumericValue,
  LABEL,
  parseNumericValue,
  RESPONSIVE_GRID,
} from "./propertyPanelHelpers";
import {
  DetailField,
  MetricField,
  Section,
  SegmentedControl,
  SelectField,
  SliderControl,
} from "./propertyPanelPrimitives";

const MEDIA_TAGS = new Set(["video", "audio"]);

export function isMediaElement(element: DomEditSelection): boolean {
  return MEDIA_TAGS.has(element.tagName);
}

function formatTimingValue(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0.00s";
  return `${seconds.toFixed(2)}s`;
}

function parseTimingValue(input: string): number | null {
  const cleaned = input.replace(/s$/i, "").trim();
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function MediaSection({
  element,
  styles,
  onSetStyle,
  onSetAttribute,
  onSetHtmlAttribute,
}: {
  element: DomEditSelection;
  styles: Record<string, string>;
  onSetStyle: (prop: string, value: string) => void | Promise<void>;
  onSetAttribute: (attr: string, value: string) => void | Promise<void>;
  onSetHtmlAttribute: (attr: string, value: string | null) => void | Promise<void>;
}) {
  const isVideo = element.tagName === "video";
  const el = element.element;

  const volume = parseNumericValue(element.dataAttributes.volume ?? "") ?? 1;
  const volumePercent = Math.round(volume * 100);

  const mediaStart =
    Number.parseFloat(
      element.dataAttributes["media-start"] ?? element.dataAttributes["playback-start"] ?? "0",
    ) || 0;

  const hasLoop = el.hasAttribute("loop");
  const hasMuted = el.hasAttribute("muted");
  const hasAudio = element.dataAttributes["has-audio"] === "true";

  const playbackRate = Number.parseFloat(element.dataAttributes["playback-rate"] ?? "1") || 1;

  const objectFit = styles["object-fit"] || "contain";
  const objectPosition = styles["object-position"] || "center";

  const poster = el.getAttribute("poster") ?? "";
  const src = el.getAttribute("src") ?? "";

  return (
    <Section
      title={isVideo ? "Video" : "Audio"}
      icon={isVideo ? <Film size={15} /> : <Music size={15} />}
    >
      <div className="space-y-4">
        {src && (
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.12em] text-neutral-500">Source</div>
            <div className="mt-1 truncate text-[11px] font-medium text-neutral-300" title={src}>
              {src.split("/").pop() || src}
            </div>
          </div>
        )}

        <div className="grid min-w-0 gap-1.5">
          <span className={LABEL}>Volume</span>
          <SliderControl
            value={volumePercent}
            min={0}
            max={100}
            step={1}
            displayValue={`${volumePercent}%`}
            formatDisplayValue={(next) => `${Math.round(next)}%`}
            onCommit={(next) => {
              void onSetAttribute("volume", formatNumericValue(next / 100));
            }}
          />
        </div>

        <MetricField
          label="Rate"
          value={formatNumericValue(playbackRate)}
          onCommit={(next) => {
            const parsed = Number.parseFloat(next);
            if (!Number.isFinite(parsed) || parsed < 0.1 || parsed > 5) return;
            void onSetAttribute("playback-rate", formatNumericValue(parsed));
          }}
        />

        <MetricField
          label="Media start"
          value={formatTimingValue(mediaStart)}
          onCommit={(next) => {
            const parsed = parseTimingValue(next);
            if (parsed == null) return;
            void onSetAttribute("media-start", parsed.toFixed(2));
          }}
        />

        <div className={RESPONSIVE_GRID}>
          <div className="grid min-w-0 gap-1.5">
            <span className={LABEL}>Loop</span>
            <SegmentedControl
              value={hasLoop ? "on" : "off"}
              onChange={(next) => {
                void onSetHtmlAttribute("loop", next === "on" ? "true" : null);
              }}
              options={[
                { label: "On", value: "on" },
                { label: "Off", value: "off" },
              ]}
            />
          </div>
          <div className="grid min-w-0 gap-1.5">
            <span className={LABEL}>Muted</span>
            <SegmentedControl
              value={hasMuted ? "on" : "off"}
              onChange={(next) => {
                void onSetHtmlAttribute("muted", next === "on" ? "true" : null);
              }}
              options={[
                { label: "On", value: "on" },
                { label: "Off", value: "off" },
              ]}
            />
          </div>
        </div>

        {isVideo && (
          <div className="grid min-w-0 gap-1.5">
            <span className={LABEL}>Has audio track</span>
            <SegmentedControl
              value={hasAudio ? "yes" : "no"}
              onChange={(next) => {
                if (next === "yes") {
                  void onSetAttribute("has-audio", "true");
                  void onSetHtmlAttribute("muted", null);
                } else {
                  void onSetAttribute("has-audio", "");
                  void onSetHtmlAttribute("muted", "true");
                }
              }}
              options={[
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" },
              ]}
            />
          </div>
        )}

        {isVideo && (
          <>
            <div className={RESPONSIVE_GRID}>
              <SelectField
                label="Fit"
                value={objectFit}
                onChange={(next) => {
                  void onSetStyle("object-fit", next);
                }}
                options={["contain", "cover", "fill", "none", "scale-down"]}
              />
              <DetailField
                label="Position"
                value={objectPosition}
                onCommit={(next) => {
                  void onSetStyle("object-position", next);
                }}
              />
            </div>

            <DetailField
              label="Poster"
              value={poster}
              onCommit={(next) => {
                void onSetHtmlAttribute("poster", next || null);
              }}
            />
          </>
        )}
      </div>
    </Section>
  );
}
