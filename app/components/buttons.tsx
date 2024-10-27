interface ButtonProps {
    text: string;
}
export function CharacterOutlineButton({ text }: ButtonProps) {
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
