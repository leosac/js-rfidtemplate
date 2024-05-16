import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';

function AccordionArrayFieldTemplate(props) {
  return (
    <div>
      <div>
        <h5>{props.title}</h5>
        <hr className="border-0 bg-secondary" style={{height: '1px'}}></hr>
      </div>
      <Accordion>
        {props.items && props.items.map((element) => (
          <Card key={'card_' + element.key}>
            <Accordion.Toggle as={Card.Header} eventKey={element.key}>
              <div className="row">
                <div className="col-8">
                  {element.children.props.title}
                  {(element.children.props.formData) && (
                    <>
                      {(element.children.props.formData['$type']) && (
                        <>
                          : {element.children.props.formData['$type']}
                        </>
                      )}
                      {(element.children.props.formData['label']) && (
                        <>
                          - {element.children.props.formData['label']}
                        </>
                      )}
                    </>
                  )}
                </div>
                <div className="col-4 text-right">
                  {element.hasMoveUp && (
                    <span className="m-0 p-0">
                      <button title="Move up" style={{flex: '1 1 0%', paddingLeft: '6px', paddingRight: '6px', fontWeight: 'bold'}} disabled={element.index === 0} type="button" className="btn btn-light btn-sm" onClick={element.onReorderClick(element.index, element.index - 1)}>
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M868 545.5L536.1 163a31.96 31.96 0 0 0-48.3 0L156 545.5a7.97 7.97 0 0 0 6 13.2h81c4.6 0 9-2 12.1-5.5L474 300.9V864c0 4.4 3.6 8 8 8h60c4.4 0 8-3.6 8-8V300.9l218.9 252.3c3 3.5 7.4 5.5 12.1 5.5h81c6.8 0 10.5-8 6-13.2z"></path></svg>
                      </button>
                    </span>
                  )}
                  {element.hasMoveDown && (
                    <span className="m-0 p-0">
                      <button title="Move down" style={{flex: '1 1 0%', paddingLeft: '6px', paddingRight: '6px', fontWeight: 'bold'}} disabled={element.index === (props.items.length - 1)} type="button" className="btn btn-light btn-sm" onClick={element.onReorderClick(element.index, element.index + 1)}>
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M862 465.3h-81c-4.6 0-9 2-12.1 5.5L550 723.1V160c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v563.1L255.1 470.8c-3-3.5-7.4-5.5-12.1-5.5h-81c-6.8 0-10.5 8.1-6 13.2L487.9 861a31.96 31.96 0 0 0 48.3 0L868 478.5c4.5-5.2.8-13.2-6-13.2z"></path></svg>
                      </button>
                    </span>
                  )}
                  {element.hasCopy && (
                    <span className="m-0 p-0">
                      <button title="Copy" style={{flex: '1 1 0%', paddingLeft: '6px', paddingRight: '6px', fontWeight: 'bold'}} type="button" className="btn btn-light btn-sm" onClick={element.onCopyIndexClick(element.index)}>
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M352 115h90c3.3 0 6-2.7 6-6 0-8.2-3.7-16-10-21.3l-77.1-64.2c-4.9-4.1-14.2-7.4-20.6-7.4-4.1 0-7.4 3.3-7.4 7.4V96c.1 10.5 8.6 19 19.1 19z"></path><path d="M307 96V16H176c-17.6 0-32 14.4-32 32v336c0 17.6 14.4 32 32 32h240c17.6 0 32-14.4 32-32V141h-96c-24.8 0-45-20.2-45-45z"></path><path d="M116 412V80H96c-17.6 0-32 14.4-32 32v352c0 17.6 14.4 32 32 32h256c17.6 0 32-14.4 32-32v-20H148c-17.6 0-32-14.4-32-32z"></path></svg>
                      </button>
                    </span>
                  )}
                  {element.hasRemove && (
                    <span className="m-0 p-0">
                      <button title="Remove" style={{flex: '1 1 0%', paddingLeft: '6px', paddingRight: '6px', fontWeight: 'bold'}} type="button" className="btn btn-danger btn-sm" onClick={element.onDropIndexClick(element.index)}>
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M368.5 240h-225c-8.8 0-16 7.2-16 16 0 4.4 1.8 8.4 4.7 11.3 2.9 2.9 6.9 4.7 11.3 4.7h225c8.8 0 16-7.2 16-16s-7.2-16-16-16z"></path></svg>
                      </button>
                    </span>
                  )}
                  <span class="rotate-icon">&gt;</span>
                </div>
              </div>
            </Accordion.Toggle>
            <Accordion.Collapse eventKey={element.key}>
              <Card.Body>
                {element.children}
              </Card.Body>
            </Accordion.Collapse>
          </Card>
        ))}
      </Accordion>
      {props.canAdd && (
        <div className="py-4 col-lg-3 col-3 col-3">
          <button style={{width: '100%'}} title="Add Item" type="button" className="ml-1 array-item-add btn btn-primary" onClick={props.onAddClick}>
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M8 3.5a.5.5 0 01.5.5v4a.5.5 0 01-.5.5H4a.5.5 0 010-1h3.5V4a.5.5 0 01.5-.5z" clipRule="evenodd"></path><path fillRule="evenodd" d="M7.5 8a.5.5 0 01.5-.5h4a.5.5 0 010 1H8.5V12a.5.5 0 01-1 0V8z" clipRule="evenodd"></path></svg>
          </button>
        </div>
      )}
    </div>
  );
}

function BasicFieldTemplate(props) {
  let classNames = props.classNames;
  if (props.schema['x-hidden']) {
    classNames += " d-none";
  }
  return (
    <div className={classNames} style={props.style}>
      {props.displayLabel && (
        <label className="form-label" htmlFor={props.id}>
          {props.label}
          {props.required ? '*' : null}
        </label>
      )}
      {props.children}
      {props.displayLabel && (
        <small className="text-muted form-text">{props.description}</small>
      )}
      {!props.hideError && props.errors}
      {props.help}
    </div>
  );
}

function ObjectFieldTemplate(props) {
  if ((props.schema.properties && props.schema.properties['$type']) || !props.title) {
    return (
      <div>
        {props.title && (
          <div>
            <h5>{props.title}</h5>
            <hr className="border-0 bg-secondary" style={{height: '1px'}}></hr>
          </div>
        )}
        <div>
          <div className="mb-3">{props.description}</div>
        </div>
        <div className="p-0 container-fluid">
          {props.properties.map((element) => (
            <div className="row">
              <div className="col-12">
                {element.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  } else {
    return (
      <Accordion>
        <Card>
          <Accordion.Toggle as={Card.Header} eventKey="0">
            <div className="row">
              <div className="col-8">
                <h5>{props.title}</h5>
              </div>
              <div className="col-4 text-right">
                <span class="rotate-icon">&gt;</span>
              </div>
            </div>
          </Accordion.Toggle>
          <Accordion.Collapse eventKey="0">
            <Card.Body>
              <div>
                <div className="mb-3">{props.description}</div>
              </div>
              <div className="p-0 container-fluid">
                {props.properties.map((element) => (
                  <div className="row">
                    <div className="col-12">
                      {element.content}
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>
    );
  }
}

const uiTemplates = {
  ArrayFieldTemplate: AccordionArrayFieldTemplate,
  FieldTemplate: BasicFieldTemplate,
  ObjectFieldTemplate: ObjectFieldTemplate
};

export default uiTemplates;