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
                <div className="col-9">
                  {element.children.props.title}
                  {(element.children.props.formData['$type']) && (
                    <>
                      : {element.children.props.formData['$type']}
                    </>
                  )}
                </div>
                <div className="col-3 text-right">
                {element.hasRemove && (
                  <span className="m-0 p-0">
                    <button title="Remove" style={{flex: '1 1 0%', paddingLeft: '6px', paddingRight: '6px', fontWeight: 'bold'}} type="button" className="btn btn-danger btn-sm" onClick={element.onDropIndexClick(element.index)}>
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M368.5 240h-225c-8.8 0-16 7.2-16 16 0 4.4 1.8 8.4 4.7 11.3 2.9 2.9 6.9 4.7 11.3 4.7h225c8.8 0 16-7.2 16-16s-7.2-16-16-16z"></path></svg>
                    </button>
                  </span>
                )}
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

const uiTemplates = {
  ArrayFieldTemplate: AccordionArrayFieldTemplate
};

export default uiTemplates;