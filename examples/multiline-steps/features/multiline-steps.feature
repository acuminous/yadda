Feature: Multiline Step Examples


Scenario: Parse a CSV multiline step

    Given a csv file
    --------------------------
    First Name,Second Name,Age
    John,Smith,41
    Joe,Blogs,23
    --------------------------
    Then John is older than Joe


Scenario: Read a Poem

    Good Times
    ----------
    May we go our separate ways,
    Finding fortune and new friends.
    But let us not forget these days,
    Or let the good times ever end.

    A poet with wiser words than mine,
    Wrote that nothing gold can stay.
    These are golden days we're in,
    And so are bound to fade away.
    ----------
    Has 2 verses