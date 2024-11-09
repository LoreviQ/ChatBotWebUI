import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export function CharacterOutlineButton({ text }: { text: string }) {
    return (
        <button
            className="py-2 px-4 border rounded font-semibold
                bg-transparent  text-character border-character
                hover:bg-character hover:text-contrast hover:border-transparent
            "
        >
            {text}
        </button>
    );
}

export function FakeXFooterButton({
    icon,
    count,
    onClick = () => {},
}: {
    icon: IconDefinition;
    count: number;
    onClick?: () => void;
}) {
    return (
        <button className="flex space-x-2 px-4 py-2 rounded-full items-center hover:bg-hover-dark" onClick={onClick}>
            <FontAwesomeIcon icon={icon} />
            <p>{count}</p>
        </button>
    );
}
