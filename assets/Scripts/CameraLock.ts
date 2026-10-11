import { _decorator, Component, Node, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('CameraFollow')
export class CameraFollow extends Component {
    @property(Node)
    target: Node = null!;

    @property
    position: Vec3 = new Vec3(0,8,6);

    update() {
        if (!this.target) {
            return;
        }

        const targetPosition = this.target.worldPosition;

        this.node.setWorldPosition(
            new Vec3(targetPosition.x + this.position.x,
                targetPosition.y + this.position.y,
                targetPosition.z + this.position.z)
        );

        this.node.lookAt(targetPosition);
    }
}