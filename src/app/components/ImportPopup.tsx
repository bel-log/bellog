import * as React from "react";

export const ImportPopup = (props: { isOpen: boolean, onSelect: (name: string, url: string) => void }) => {

    const isOpen = props.isOpen
    const [sampleList, setSampleList] = React.useState([])

    React.useEffect(() => {
        (async () => {
            let sampleList = []
            const url = `https://api.github.com/repos/bel-log/bellog/git/trees/master`;
            const list = await fetch(url).then(res => res.json());
            const dir = list.tree.find(node => node.path === "samples");
            if (dir) {
                const list = await fetch(dir.url).then(res => res.json());
                for (let i = 0; i < list.tree.length; i++) {
                    const sampleFolder = list.tree[i];
                    const sampleFolderContent = await fetch(sampleFolder.url).then(res => res.json());
                    for(let w = 0; w < sampleFolderContent.tree.length; w++) {
                        if(sampleFolderContent.tree[w].path.indexOf(".bll") > 0) {
                            sampleList.push(
                                {
                                    name: sampleFolder.path,
                                    url: "https://raw.githubusercontent.com/bel-log/bellog/master/samples/" + 
                                    sampleFolder.path + "/" + 
                                    sampleFolderContent.tree[w].path
                                }
                            );
                            break;
                        }
                    }
                }
            }

            setSampleList(sampleList);
        })();

    }, [])

    return (
        <div className={`modal ${isOpen ? "is-active" : ""}`}>
            <div className="modal-background"></div>
            <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">Import Sample</p>
                </header>
                <section className="modal-card-body">

                    <article className="panel is-primary">
                        {
                            sampleList.map((sample) => {
                                return (
                                    <a key={sample.name} className="panel-block" onClick={() => props.onSelect(sample.name, sample.url)}>
                                        <span className="panel-icon">
                                            <i className="fas fa-book" aria-hidden="true"></i>
                                        </span>
                                        {sample.name}
                                    </a>
                                )
                            })
                        }
                    </article>
                </section>
                <footer className="modal-card-foot">
                    <button className="button"
                        onClick={() => props.onSelect("", "")}>
                        Cancel
                    </button>
                </footer>
            </div>
        </div>

    )
}
