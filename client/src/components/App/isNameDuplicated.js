export default function (name, users) {

    for (let i = 0; i < users.length; i++) {
        if (users[i].name === name) {
            return true;
        }
    }

    return false;
}