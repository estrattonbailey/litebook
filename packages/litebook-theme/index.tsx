import * as React from "react";
import { HashRouter, Route, Link } from "react-router-dom";

export function Theme(props: { index: any[] }) {
  return (
    <div className="p1">
      <HashRouter>
        <nav
          className="f aic fw mb1 pb1"
          style={{
            marginLeft: "-1em",
            borderBottom: '3px solid currentColor',
          }}
        >
          {props.index.map(story => (
            <div key={story.id} className="px1 py05">
              <Link to={"/" + story.id}>
                {story.id}
              </Link>
            </div>
          ))}
        </nav>

        {props.index.map(story => {
          const Comp = story.component ? story.component.default : null;
          return <Route key={story.id} path={"/" + story.id} render={() => {
            return story.errors.length ? (
              <pre style={{ color: 'tomato' }}>
                <code dangerouslySetInnerHTML={{ __html: story.errors[0] }} />
              </pre>
            ) : (
              <Comp />
            );
          }} />;
        })}
      </HashRouter>
    </div>
  );
}
