Yarn: Pirate Example

Adventure: A bottle falls from the wall

    Giveth 100 green bottles are standing on the wall
    whence 1 green bottle accidentally falls
    thence there are 99 green bottles standing on the wall

Sortie: No bottles are left

    Giveth 1 green bottles are standing on the wall
    whence 1 green bottle accidentally falls
    thence there are 0 green bottles standing on the wall

@Brig
Adventure: Bottles are reset

    Giveth there are no green bottles
    whence 5 minutes has elapsed
    thence there are 100 green bottles standing on the wall

Adventure: [N] bottles are standing on a wall

    Giveth [N] green bottles are standing on the wall
    whence 1 green bottle accidentally falls
    thence there are [N-1] green bottles standing on the wall

    Wherest:
        N   | N-1
        100 | 99
        99  | 98
        10  | 9
