import { React, useId } from "react";
import { withTranslation } from "react-i18next";
import EncodingActionTrigger from "./EncodingActionTrigger";

class EncodingActionProperties extends React.Component {
	render() {
        const { t } = this.props;
        const propId = useId();
		return (
            <div>
                <h1>{this.props.name}</h1>
                <div class="accordion" id={'accordion_' + propId}>
                    <div class="accordion-item">
                        <h2 class="accordion-header" id={'headingProperties_' + propId}>
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={'#collapseProperties_' + propId} aria-expanded="false" aria-controls={'collapseProperties_' + propId}>
                            {t('action.properties')}
                        </button>
                        </h2>
                        <div id={'collapseProperties_' + propId} class="accordion-collapse collapse" aria-labelledby={'headingProperties_' + propId} data-bs-parent={'#accordion_' + propId}>
                        <div class="accordion-body">
                            <strong>This is the second item's accordion body.</strong>
                        </div>
                        </div>
                    </div>
                    <div class="accordion-item">
                        <h2 class="accordion-header" id={'headingParameters_' + propId}>
                        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target={'#collapseParameters_' + propId} aria-expanded="true" aria-controls={'collapseParameters_' + propId}>
                            {t('action.parameters')}
                        </button>
                        </h2>
                        <div id={'collapseParameters_' + propId} class="accordion-collapse collapse show" aria-labelledby={'headingParameters_' + propId} data-bs-parent={'#accordion_' + propId}>
                        <div class="accordion-body">
                            {this.props.children}
                        </div>
                        </div>
                    </div>
                    <div class="accordion-item">
                        <h2 class="accordion-header" id={'headingTriggers_' + propId}>
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={'#collapseTriggers_' + propId} aria-expanded="false" aria-controls={'collapseTriggers_' + propId}>
                            {t('action.triggers')}
                        </button>
                        </h2>
                        <div id={'collapseTriggers_' + propId} class="accordion-collapse collapse" aria-labelledby={'headingTriggers_' + propId} data-bs-parent={'#accordion_' + propId}>
                        <div class="accordion-body container">
                            <div class="row">
                                <div class="col">
                                    <EncodingActionTrigger title={t('action.onsuccess')} trigger={this.state.onSuccess} />
                                </div>
                                <div class="col">
                                    <EncodingActionTrigger title={t('action.onfailure')} trigger={this.state.onFailure} />
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
            </div>
        );
	}
}

export default withTranslation()(EncodingActionProperties);