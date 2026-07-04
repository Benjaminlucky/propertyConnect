import Link from "next/link";
import { Listing, listingPath } from "@/lib/listings";
import { Seal } from "@/components/Seal";
import {
  BedIcon,
  BathIcon,
  ToiletIcon,
  MapPinIcon,
  CheckCircleIcon,
} from "@/components/ui/Icons";

export function ListingCard({
  listing: l,
  marketSlug,
}: {
  listing: Listing;
  marketSlug: string;
}) {
  return (
    <Link className="card" href={`/${marketSlug}/${listingPath(l)}`}>
      {/* Photo / placeholder */}
      <div className="ph">
        {l.photos?.[0] && (
          <img
            src={l.photos[0].replace("/upload/", "/upload/w_600,h_450,c_fill/")}
            alt={l.title}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
        <span className="cat">{l.category}</span>
        {l.verified && (
          <span className="vbadge">
            <Seal size={26} />
          </span>
        )}
        {!l.photos?.[0] && (
          <span className="imgtxt">
            {l.neighbourhood}, {l.lga}
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="body">
        <div className="price tabnum">
          {l.price}
          {l.period && <span>{l.period}</span>}
        </div>
        <div className="ttl">{l.title}</div>

        <div className="loc">
          <MapPinIcon size={13} strokeWidth={1.8} className="icon-inline" />
          {" "}{l.neighbourhood}, {l.state}
        </div>

        {l.beds > 0 && (
          <div className="specs">
            <span>
              <BedIcon size={14} strokeWidth={1.7} className="icon-inline" />
              {" "}{l.beds}
            </span>
            <span>
              <BathIcon size={14} strokeWidth={1.7} className="icon-inline" />
              {" "}{l.baths}
            </span>
            <span>
              <ToiletIcon size={14} strokeWidth={1.7} className="icon-inline" />
              {" "}{l.toilets}
            </span>
          </div>
        )}

        <div className="agent">
          <span className="av">{l.agentInitials}</span>
          <span className="nm">
            {l.agent}
            {l.verified && (
              <>
                {" "}·{" "}
                <CheckCircleIcon
                  size={12}
                  strokeWidth={2}
                  className="icon-inline"
                  style={{ color: "var(--ok)" } as React.CSSProperties}
                />{" "}
                verified
              </>
            )}
          </span>
        </div>
      </div>
    </Link>
  );
}
