import * as React from "react";
import { useLayoutEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export const CollpaseGroup = (props: {
    array: Array<any>,
    eyeIcon?: boolean,
    deleteIcon?: boolean,
    duplicateIcon?: boolean,
    getTitle: (index: number) => string,
    getId: (index: number) => number,
    getEyeStatus?: (index: number) => boolean,
    duplicateClick?: (item, index) => void,
    setNewArray: (array: Array<any>) => void,
    children: (item: any, index: number) => React.ReactNode
}) => {

    const preventExpandOnDragRef = React.useRef<boolean>(false)
    const array = props.array
    const setNewArray = props.setNewArray

    // Function to update list on drop
    const handleDrop = (droppedItem) => {
        // Ignore drop outside droppable container
        if (!droppedItem.destination) return;
        var updatedList = [...array];
        // Remove dragged item
        const [reorderedItem] = updatedList.splice(droppedItem.source.index, 1);
        // Add dropped item
        updatedList.splice(droppedItem.destination.index, 0, reorderedItem);
        // Update State
        setNewArray(updatedList);
    };
    /* Drag element needs to be re-created if length changes */
    return (
        <DragDropContext key={array.length}
            onDragStart={() => {
                preventExpandOnDragRef.current = true
            }}
            onDragEnd={
                (droppedItem) => {
                    handleDrop(droppedItem)
                    setTimeout(() => { preventExpandOnDragRef.current = false }, 100)
                }
            }>
            <Droppable droppableId="list-container">
                {(provided) => (
                    <div
                        className="list-container p-1"
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                    >
                        {
                            array.map((elem, index) => {
                                const [isExpanded, setIsExpanded] = useState(false)

                                function expand() {
                                    if (!preventExpandOnDragRef.current) {
                                        setIsExpanded(!isExpanded)
                                    }
                                }

                                function eyeClick(eyeOff) {
                                    setNewArray(
                                        array.map((val, n_index) => {
                                            if (n_index == index) {
                                                return { ...val, ...{ disabled: !eyeOff } }
                                            }
                                            else
                                                return val
                                        }))
                                }

                                function deleteClick() {
                                    setNewArray(array.filter((val, n_index) => {
                                        return n_index != index
                                    }))
                                }

                                function duplicateClick() {
                                    props?.duplicateClick(elem, index)
                                }

                                return (

                                    <Draggable className="card is-fullwidth is-unselectable "
                                        key={props.getId(index)} draggableId={props.getId(index).toString()} index={index}
                                        isDragDisabled={isExpanded}>
                                        {(provided) => (
                                            <div
                                                className="item-container"
                                                ref={provided.innerRef}
                                                {...provided.dragHandleProps}
                                                {...provided.draggableProps}

                                            >
                                                <header className="list-item-collpase is-clickable" onClick={() => { expand() }}>
                                                    <p className="is-flex-grow-1">{props.getTitle(index)}</p>
                                                    {
                                                        props.duplicateIcon ? <a className="card-header-icon is-clickable"
                                                            onClick={(e) => { e.stopPropagation(); duplicateClick() }}>
                                                            <i className={`fa fa-copy`} ></i> </a> : ""
                                                    }
                                                    {
                                                        props.eyeIcon ? <a className="card-header-icon is-clickable"
                                                            onClick={(e) => { e.stopPropagation(); eyeClick(props.getEyeStatus(index) ?? false) }}>
                                                            <i className={`fa ${(props.getEyeStatus(index)) ? "fa-eye-slash" : "fa-eye"}`} ></i> </a> : ""
                                                    }
                                                    {
                                                        props.deleteIcon ? <a className="card-header-icon is-clickable has-text-danger"
                                                            onClick={(e) => { e.stopPropagation(); deleteClick() }}>
                                                            <i className={`fa fa-trash`} ></i> </a> : ""
                                                    }
                                                    <a className="card-header-icon card-toggle">
                                                        <i className="fa fa-angle-down" ></i>
                                                    </a>
                                                </header>
                                                {
                                                    <div className={`list-item-collpase-container ${isExpanded ? "" : "is-hidden"}`} style={{ cursor: "auto" }}>
                                                        <div>
                                                            {props.children(elem, index)}
                                                        </div>
                                                    </div>
                                                }
                                            </div>

                                        )}

                                    </Draggable>
                                )


                            })

                        }

                        {provided.placeholder}
                    </div>
                )}

            </Droppable>
        </DragDropContext >
    )
}