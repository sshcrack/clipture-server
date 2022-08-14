import { ChangeEvent, useState } from "react";


export default function PrivatePage() {
    const [image, setImage] = useState<File | null>(null);
    const [createObjectURL, setCreateObjectURL] = useState<string | null>(null);

    const uploadToClient = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const i = event.target.files[0];

            setImage(i);
            setCreateObjectURL(URL.createObjectURL(i));
        }
    };

    const uploadToServer = async () => {
        const body = new FormData();
        body.append("file", image as File)
        console.log("Body is", body, image)
        let request = new XMLHttpRequest();
        request.open('POST', `/api/clip/upload?fileSize=${(image as File).size}`);

        // upload progress event
        request.upload.addEventListener('progress', function (e) {
            // upload progress as percentage
            let percent_completed = (e.loaded / e.total) * 100;
            console.log(percent_completed);
        });

        // request finished event
        request.addEventListener('load', function (e) {
            // HTTP status message (200, 404 etc)
            console.log(request.status);

            // request.response holds response from the server
            console.log(request.response);
        });

        // send POST request to server
        request.send(body);
    };

    return (
        <div>
            <div>
                <img alt='uploaded' src={createObjectURL ?? ""} />
                <h4>Select Image</h4>
                <input accept='video/mp4' type="file" name="myImage" onChange={uploadToClient} />
                <button
                    className="btn btn-primary"
                    type="submit"
                    onClick={uploadToServer}
                >
                    Send to server
                </button>
            </div>
        </div>
    );
}
