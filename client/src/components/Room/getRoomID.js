export default function (component) {

    const pathArray = component.props.location.pathname.split('/');

    for (let i = pathArray.length - 1; i >= 0; i--) {
        if (pathArray[i] === '') {
            pathArray.pop()
        }
        else {
            break;
        }
    }
    return pathArray[pathArray.length - 1];
}