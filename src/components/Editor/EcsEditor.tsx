import React, {Fragment, RefObject} from 'react'
import {
    Camera,
    EndedRenderEvent,
    Entity,
    EntityContainer,
    FullRerenderEvent,
    RerenderEvent,
    SystemContainerInterface,
    Vector,
    Viewbox
} from '../../lib'
import {CameraComponent, MouseEventComponent, MousePositionComponent, HtmlElementComponent} from './components'
import {MAIN_CAMERA, MAIN_MOUSE} from './constants'

type Props = {
    entityContainer: EntityContainer,
    systemContainer: SystemContainerInterface
}

type State = {}

export default class EcsEditor extends React.Component<Props, State> {
    cameraComponent: CameraComponent = new CameraComponent;
    htmlElementComponent: HtmlElementComponent = new HtmlElementComponent;
    cameraEntity?: Entity;

    constructor(props: Props) {
        super(props);
        // this.init();
    }

    init = () => {
        this.cameraComponent.camera = new Camera(new Vector(0, 0, -1), new Viewbox(new Vector(0, 0), new Vector(500, 500)));

        this.refillCameraEntity()

        this.refillMouseEntity()

    }

    private refillMouseEntity() {

        this.props.entityContainer.removeEntitiesWithTag(MAIN_MOUSE);

        this.props.entityContainer.createEntity([
            new MousePositionComponent,
            new MouseEventComponent,
        ], [MAIN_MOUSE])
    }

    private refillCameraEntity() {

        this.props.entityContainer.removeEntitiesWithTag(MAIN_CAMERA);

        this.cameraEntity = this.props.entityContainer.createEntity([
            this.cameraComponent,
            this.htmlElementComponent
        ], [MAIN_CAMERA])
    }

    componentDidMount() {
        if (!this.props.entityContainer || !this.props.systemContainer) {
            this.forceUpdate();

            return;
        }


        this.init();

        this.props.systemContainer.getAll().forEach((system) => {
            system.onMount()
        })

        if (!this.props.entityContainer) {
            return;
        }
        this.props.entityContainer.getEventManager().subscribe(FullRerenderEvent, this.fullRerender);
        this.props.entityContainer.getEventManager().subscribe(RerenderEvent, this.rerender);

        this.forceUpdate();
    }

    rerender = (event?: RerenderEvent) => {
        this.props.systemContainer.getActive().forEach((system) => {
            system.render()
        })

        this.props.entityContainer.getEventManager().dispatch(new EndedRenderEvent)
    }

    componentWillUnmount() {
        if (!this.props.entityContainer || !this.props.systemContainer) {
            return;
        }
        this.props.systemContainer.getAll().forEach((system) => system.onUnMount())

        this.props.entityContainer.getEventManager().unsubscribe(FullRerenderEvent, this.fullRerender);
        this.props.entityContainer.getEventManager().unsubscribe(RerenderEvent, this.rerender);
    }

    fullRerender = (event: FullRerenderEvent) => {
        this.forceUpdate()
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
        this.rerender();
    }

    render(): React.ReactNode {
        if (!this.props.entityContainer || !this.props.systemContainer) {
            return;
        }

        return <div id={"ecs-editor-root"} style={{
            display: "flex",
            overflow: 'hidden'
        }}
                    ref={(div: HTMLDivElement) => {
                        this.htmlElementComponent.element = div;
                    }}
        >
            {this.props.systemContainer.getActive().map((system, key) => {
                return <Fragment key={key}>{system.reactRender()}</Fragment>
            })}
        </div>;
    }
}
