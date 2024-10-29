import { useOutletContext } from "react-router-dom";

import type { OutletContextFromCharacter } from "./characters.$character";
import { FullChat } from "./characters.$character.chat.$thread";
import { PostLog } from "./characters.$character.posts";
import { EventLog } from "./characters.$character.events";

export default function CharacterAll() {
    const { userPrefs, character, messages, posts, events, detached } = useOutletContext<OutletContextFromCharacter>();

    return (
        <div>
            <div className="flex">
                <div className="w-1/3">
                    <EventLog events={events} userPrefs={userPrefs} component={false} detached={detached} />
                </div>
                <div className="w-1/3">
                    <FullChat
                        character={character}
                        messages={messages}
                        userPrefs={userPrefs}
                        thread={"1"}
                        detached={detached}
                    />
                </div>
                <div className="w-1/3">
                    <PostLog
                        character={character}
                        posts={posts}
                        userPrefs={userPrefs}
                        component={false}
                        detached={detached}
                    />
                </div>
            </div>
        </div>
    );
}
