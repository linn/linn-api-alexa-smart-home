class AssociatedDevice {
    id: string;
    serialNumber: string;
    category: string;
    model: string;
    name: string;
    links: LinkResource[];
}

class LinkResource {
    rel: string;
    href: string;
}

export {AssociatedDevice};