export function characterErrMessage(message: string) {
    return (
        <div className="flex flex-col h-screen">
            <div className="overflow-auto flex flex-grow flex-col-reverse pt-20">
                <div className="text-center text-text-muted-dark my-4">{message}</div>
            </div>
        </div>
    );
}
