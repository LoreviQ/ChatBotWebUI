import { CharacterOutlineButton } from "../components/buttons";
import { render, screen } from "@testing-library/react";

test("Renders CharacterOutlineButton", async () => {
    render(<CharacterOutlineButton text="Hello" />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
});
